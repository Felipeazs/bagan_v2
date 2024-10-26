import { HTTPException } from "hono/http-exception"
import { Payment, Preference } from "mercadopago"
import crypto from "node:crypto"

import { mercadoPagoClient } from "@/server/lib/mercadopago"
import { AppRouteHandler } from "@/server/lib/types"
import { getResumenCompraTemplate } from "@/server/utils/email-templates"
import { createBody, paymentDetails } from "@/server/utils/payment"
import { setPreferenceDetails } from "@/server/utils/preference"
import env from "@/utils/env"
import { FeedbackRoute, PreferenceRoute } from "./mercadopago.routes"
import { sendWebhookMessage } from "@/server/lib/discord"
import { PaymentInfo } from "@/server/types"
import { mailtrapClient } from "@/server/lib/mailtrap"

export const preferenceId: AppRouteHandler<PreferenceRoute> = async (c) => {
	const comprador = c.req.valid("json")

	try {
		const prefDetails = setPreferenceDetails(comprador)

		const preference = new Preference(mercadoPagoClient)

		const pref_body = createBody(prefDetails)
		const res = await preference.create({
			body: pref_body,
		})

		if (res.api_response.status === 201) {
			return c.json({ prefId: res.id! }, 201)
		} else {
			return c.json({ message: "invalid parameters" }, 400)
		}
	} catch (err) {
		console.error("Caught an error at /create-preference: ")
		throw new HTTPException(500, {
			message: "Server error creating MercadoPago preference",
			cause: err,
		})
	}
}

export const feedback: AppRouteHandler<FeedbackRoute> = async (c) => {
	const { data, type } = c.req.valid("json")

	if (type != "payment") {
		c.status(200)
		return c.json({ message: `no ${type} info` })
	}

	const x_signature = c.req.header("x-signature")
	const x_request_id = c.req.header("x-request-id")

	if (!x_signature || !x_request_id) {
		return c.json({ message: "Invalid webhook signature" }, 403)
	}

	const signatureParts = x_signature.split(",")

	let ts
	let hash
	signatureParts.forEach((part) => {
		const [key, value] = part.split("=")
		if (key && value) {
			const trimmedKey = key.trim()
			const trimmedValue = value.trim()
			if (trimmedKey === "ts") {
				ts = trimmedValue
			} else if (trimmedKey === "v1") {
				hash = trimmedValue
			}
		}
	})

	const manifest = `id:${data.id};request-id:${x_request_id};ts:${ts};`

	const { NODE_ENV, NM_MAILTRAP_FROM, NM_MAILTRAP_RECEIVER, MPW_SECRET } = env

	const hmac = crypto.createHmac("sha256", MPW_SECRET)
	hmac.update(manifest)

	const sha = hmac.digest("hex")

	if (sha !== hash) {
		return c.json({ message: "Invalid webhook signature" }, 403)
	}

	try {
		const payment = new Payment(mercadoPagoClient)
		const payment_data = await payment.get({ id: data.id })

		if (!payment_data) {
			return c.json({ message: "No payment data created" }, 404)
		}

		const details: PaymentInfo = paymentDetails(payment_data)
		let compras: { name: string; value: string }[] = []
		details.additional_info?.items?.forEach((i) => {
			compras.push({
				name: i.title,
				value: `$${i.unit_price.toLocaleString("es-Cl")} x ${i.quantity}\n${i.description}`,
			})
		})

		await sendWebhookMessage({
			title: details.id?.toString() ?? "",
			description: "Revisa ventas@bagan.cl para ver los detalles",
			content: "Nueva compra",
			fields: [
				...compras,
				{
					name: "Contacto",
					value: `${details.payer.name}\n${details.payer.email}\n+56 ${details.payer.phone.number}`,
				},
				{
					name: "Dirección",
					value: `${details.shipments.street_name} ${details.shipments.street_number}, ${details.shipments.apartment ? "casa/depto: " + details.shipments.apartment + ", " : ""} ${details.shipments.city_name}, ${details.shipments.state_name}`,
				},
			],
		})

		const mailtrap_info = {
			from: { name: "No responder", email: NM_MAILTRAP_FROM },
			to: [{ email: NM_MAILTRAP_RECEIVER }],
			subject: `Nueva compra: ${details.id}`,
			category: "venta",
			html: getResumenCompraTemplate(details),
		}

		const isProd = NODE_ENV === "production"

		if (isProd) {
			mailtrapClient.send(mailtrap_info)
		} else {
			const test_inbox = await mailtrapClient.testing.inboxes.getList()

			if (test_inbox && test_inbox[0].sent_messages_count === 100) {
				console.log("test email inbox is full")
			} else if (test_inbox) {
				mailtrapClient.testing.send(mailtrap_info)
			}
		}

		return c.json({ message: "feedback email sended to Bagan!" }, 200)
	} catch (err) {
		throw new HTTPException(500, {
			message: "Server error Sending MercadoPago Feedback",
			cause: err,
		})
	}
}
