import { Hono } from "hono"
import { env } from "hono/adapter"
import { HTTPException } from "hono/http-exception"
import { Payment } from "mercadopago"
import crypto from "node:crypto"

import { sendWebhookMessage } from "@/api/discord"
import { mailtrapClient } from "@/api/mailtrap"
import { mercadoPagoClient } from "@/api/mercadopago"
import { PaymentInfo } from "@/models/types"
import { getResumenCompraTemplate } from "@/utils/email-templates"
import { paymentDetails } from "@/utils/mercadopago"

export const mercadoPagoRoute = new Hono().post("/feedback", async (c) => {
	const { data, type } = await c.req.json()

	if (type != "payment") {
		c.status(200)
		return c.json({ message: `no ${type} info` })
	}

	const x_signature = c.req.header("x-signature")
	const x_request_id = c.req.header("x-request-id")

	if (!x_signature || !x_request_id) {
		c.status(404)
		return c.json({ message: "Invalid webhook signature" })
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

	const { NODE_ENV, NM_MAILTRAP_FROM, NM_MAILTRAP_RECEIVER, MPW_SECRET } = env<{
		NODE_ENV: string
		NM_MAILTRAP_FROM: string
		NM_MAILTRAP_RECEIVER: string
		MPW_SECRET: string
	}>(c)

	const hmac = crypto.createHmac("sha256", MPW_SECRET)
	hmac.update(manifest)

	const sha = hmac.digest("hex")

	if (sha !== hash) {
		c.status(404)
		return c.json({ message: "Invalid webhook signature" })
	}

	try {
		const payment = new Payment(mercadoPagoClient)
		const payment_data = await payment.get({ id: data.id })

		if (!payment_data) {
			c.status(404)
			return c.json({ message: "No payment data created" })
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

		c.status(200)
		return c.json({ message: "feedback email sended to Bagan!" })
	} catch (err) {
		throw new HTTPException(500, {
			message: "Server error Sending MercadoPago Feedback",
			cause: err,
		})
	}
})
