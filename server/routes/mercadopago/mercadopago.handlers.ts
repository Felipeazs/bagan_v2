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
import { Context } from "hono"

export const preferenceId: AppRouteHandler<PreferenceRoute> = async (c) => {
	const comprador = c.req.valid("json")

	const prefDetails = setPreferenceDetails(comprador)

	try {
		const preference = new Preference(mercadoPagoClient)

		const pref_body = createBody(prefDetails)

		const res = await preference.create({
			body: pref_body,
		})

		if (res.api_response.status !== 201) {
			return c.json({ message: "bad request" }, 400)
		}

		return c.json({ prefId: res.id! }, 201)
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

	if (type !== "payment") {
		return c.json({ message: `no ${type} info` }, 200)
	}

	const isSignatureValid = checkSignature(c, data.id)
	if (!isSignatureValid) return c.json({ message: "Forbidden" }, 403)

	try {
		const payment = new Payment(mercadoPagoClient)
		const payment_data = await payment.get({ id: data.id })

		if (!payment_data) {
			return c.json({ message: "Bad request" }, 400)
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
			from: { name: "No responder", email: env.NM_MAILTRAP_FROM },
			to: [{ email: env.NM_MAILTRAP_RECEIVER }],
			subject: `Nueva compra: ${details.id}`,
			category: "venta",
			html: getResumenCompraTemplate(details),
		}

		const isProd = env.NODE_ENV === "production"

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

export const checkSignature = (c: Context, id: string): boolean => {
	const x_signature = c.req.header("x-signature")
	const x_request_id = c.req.header("x-request-id")

	if (!x_signature || !x_request_id) {
		return false
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

	const manifest = `id:${id};request-id:${x_request_id};ts:${ts};`

	const hmac = crypto.createHmac("sha256", env.MPW_SECRET)
	hmac.update(manifest)

	const sha = hmac.digest("hex")

	if (sha !== hash) {
		return false
	}

	return true
}
