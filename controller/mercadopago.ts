import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { env } from "hono/adapter"
import { HTTPException } from "hono/http-exception"
import { StatusCode } from "hono/utils/http-status"
import { Payment, Preference } from "mercadopago"
import crypto from "node:crypto"

import { mailtrapClient } from "@/api/mailtrap"
import { mercadoPagoClient } from "@/api/mercadopago"
import { Comprador, compradorSchema } from "@/models/comprador"
import { paymentSchema } from "@/models/payment"
import { PaymentInfo } from "@/models/types"
import { getResumenCompraTemplate } from "@/utils/email-templates"
import { createBody, paymentDetails, setPreferenceDetails } from "@/utils/mercadopago"
import { sendWebhookMessage } from "@/api/discord"

export const mercadoPagoRoute = new Hono()
	.post("/create-preference", zValidator("json", compradorSchema), async (c) => {
		const comprador: Comprador = c.req.valid("json")

		try {
			const prefDetails = setPreferenceDetails(comprador)

			const preference = new Preference(mercadoPagoClient)

			const pref_body = createBody(prefDetails)
			const res = await preference.create({
				body: pref_body,
			})

			if (res.api_response.status === 201) {
				c.status(201)
				return c.json({ prefId: res.id })
			} else {
				c.status(res.api_response.status as StatusCode)
				throw new HTTPException(500, {
					message: "Server error creating MercadoPago preference",
				})
			}
		} catch (err) {
			console.error("Caught an error at /create-preference: ")
			throw new HTTPException(500, {
				message: "Server error creating MercadoPago preference",
				cause: err,
			})
		}
	})
	.post("/feedback", async (c) => {
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

			await sendWebhookMessage({
				title: `$${details.total_paid_amount?.toLocaleString("es-Cl")}`,
				description: "Revisa ventas@bagan.cl para ver más detalles",
				content: "Nueva compra",
				footer: `${details.payer.name}\n${details.payer.email}\n+56 ${details.payer.phone.number}`,
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
	.get("/payment", zValidator("query", paymentSchema), async (c) => {
		const { id } = c.req.query()

		try {
			const payment = new Payment(mercadoPagoClient)
			const payment_data = await payment.get({ id })

			let details
			if (payment_data) details = paymentDetails(payment_data)

			c.status(200)
			return c.json(details)
		} catch (err) {
			throw new HTTPException(500, {
				message: "Server error getting MercadoPago Payment",
				cause: err,
			})
		}
	})
