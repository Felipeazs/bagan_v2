import { compradorSchema } from "@/models/comprador"
import { getResumenCompraTemplate } from "@/utils/email-templates"
import { zValidator } from "@hono/zod-validator"
import { Context, Hono } from "hono"
import { MercadoPagoConfig, Payment, Preference } from "mercadopago"

import { mailtrapClient, RECEIVER, SENDER_EMAIL } from "@/api/mailtrap"
import { PaymentInfo } from "@/models/types"
import { createBody, paymentDetails, setPreferenceDetails } from "../utils/mercadopago"

const mercadoPagoClient = new MercadoPagoConfig({
	accessToken: process.env["MP_ACCESS_TOKEN"]!,
})

export const mercadoPagoRoute = new Hono()
	.post("/create-preference", zValidator("json", compradorSchema), async (c) => {
		const comprador = c.req.valid("json")

		try {
			const prefDetails = setPreferenceDetails(comprador)

			if (!prefDetails.items.length) {
				throw new Error(
					"Existe un problema con los productos agregados, por favor inténtelo más tarde",
				)
			}

			const preference = new Preference(mercadoPagoClient)

			const pref_body = createBody(prefDetails)
			const res = await preference.create({
				body: pref_body,
			})

			if (res.api_response.status === 201) {
				c.status(201)
				return c.json({ prefId: res.id })
			}
		} catch (err) {
			console.error("Caught an error: ", (err as Error).message)
			throw new Error((err as Error).message)
		}
	})
	.post("/feedback", async (c: Context) => {
		const order = c.req.query()

		if (order.topic != "payment") {
			c.status(404)
			return c.json({ message: `no ${order.topic} info` })
		}

		try {
			const payment = new Payment(mercadoPagoClient)
			const payment_data = await payment.get({ id: order.id })

			if (!payment_data) {
				c.status(404)
				return c.json({})
			}

			const details: PaymentInfo = paymentDetails(payment_data)

			// transporter.sendMail({
			// 	from: `No responder <${process.env.NM_MAILTRAP_FROM}>`,
			// 	to: process.env.NM_MAILTRAP_RECEIVER,
			// 	subject: `Nueva compra: ${details?.id}`,
			// 	html: getResumenCompraTemplate(details),
			// })

			const mailtrap_info = {
				from: { name: "No responder", email: SENDER_EMAIL },
				to: [{ email: RECEIVER }],
				subject: `Nueva compra: ${details.id}`,
				category: "venta",
				html: getResumenCompraTemplate(details),
			}

			const isProd = process.env["NODE_ENV"] === "production"
			isProd
				? mailtrapClient.send(mailtrap_info).then(console.log).catch(console.error)
				: mailtrapClient.testing.send(mailtrap_info).then(console.log).catch(console.error)

			c.status(200)
			return c.json({ message: "feedback email sended to Bagan!" })
		} catch (err) {
			console.error("Caught an error: ", (err as Error).message)
			throw new Error((err as Error).message)
		}
	})
	.get("/payment/:id", async (c: Context) => {
		const id = c.req.param("id")

		try {
			const payment = new Payment(mercadoPagoClient)
			const payment_data = await payment.get({ id })

			let details
			if (details) details = paymentDetails(payment_data)

			c.status(200)
			return c.json(details)
		} catch (err) {
			console.error("Caught an error: ", (err as Error).message)
			throw new Error((err as Error).message)
		}
	})
