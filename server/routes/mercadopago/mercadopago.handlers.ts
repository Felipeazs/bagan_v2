import { HTTPException } from "hono/http-exception"
import { Payment, Preference } from "mercadopago"
import crypto from "node:crypto"

import db from "@/server/db"
import { codigos } from "@/server/db/schema"
import { prepareVentaWebhook, sendWebhookMessage } from "@/server/lib/discord"
import { sendEmail, TEmailType } from "@/server/lib/mailtrap"
import { mercadoPagoClient } from "@/server/lib/mercadopago"
import { AppRouteHandler } from "@/server/lib/types"
import { PaymentInfo } from "@/server/types"
import { getGiftcardTemplate, getResumenCompraTemplate } from "@/server/utils/email-templates"
import { createBody, generateRandom16CharacterString, paymentDetails } from "@/server/utils/payment"
import { setPreferenceDetails } from "@/server/utils/preference"
import env from "@/utils/env"
import { Context } from "hono"
import { FeedbackRoute, PreferenceRoute } from "./mercadopago.routes"

export const preferenceId: AppRouteHandler<PreferenceRoute> = async (c) => {
	const usuario = c.req.valid("json")

	const prefDetails = setPreferenceDetails(usuario)

	try {
		const preference = new Preference(mercadoPagoClient)

		const pref_body = createBody(prefDetails)

		const res = await preference.create({
			body: pref_body,
		})

		if (res.api_response.status !== 201) {
			return c.json({ status: false, data: "bad request" }, 400)
		}

		return c.json({ status: true, data: res.id! }, 201)
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

		const webhook_data = prepareVentaWebhook(details)
		await sendWebhookMessage(webhook_data)

		sendEmail({ type: TEmailType.contacto, html: getResumenCompraTemplate(details) })

		details.additional_info.items?.forEach(async (info) => {
			if (info.title !== "Giftcard") return

			const codigo = generateRandom16CharacterString()

			sendEmail({ type: TEmailType.giftcard, html: getGiftcardTemplate(info, codigo) })

			await db.insert(codigos).values({
				codigo,
				descripcion: info.description!,
				valor: Number(details.transaction_amount),
			})
		})

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
