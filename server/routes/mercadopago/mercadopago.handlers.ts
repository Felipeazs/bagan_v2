import crypto from "node:crypto"

import { sendWebhook } from "@/server/lib/discord"
import { sendEmail, TEmailType } from "@/server/lib/mailtrap"
import { createPreference, getFeedbackPayment } from "@/server/lib/mercadopago"
import { AppRouteHandler } from "@/server/lib/types"
import { TUsuario } from "@/server/models/usuario"
import { PaymentInfo } from "@/server/types"
import { getResumenCompraTemplate } from "@/server/utils/email-templates"
import { createBody, paymentDetails } from "@/server/utils/payment"
import { setPreferenceDetails } from "@/server/utils/preference"
import env from "@/utils/env"
import { FeedbackRoute, PreferenceRoute } from "./mercadopago.routes"

export const preferenceId: AppRouteHandler<PreferenceRoute> = async (c) => {
	const usuario = c.req.valid("json") as TUsuario

	if (!usuario) return c.json({ status: false }, 422)

	const prefDetails = setPreferenceDetails(usuario)
	const pref_body = createBody(prefDetails)

	const preference = await createPreference(pref_body)
	if (!preference) return c.json({ status: false, data: undefined }, 500)

	return c.json({ status: true, data: preference.id! }, 200)
}

export const feedback: AppRouteHandler<FeedbackRoute> = async (c) => {
	const { data, type } = c.req.valid("json")

	if (type !== "payment") {
		return c.json({ status: false }, 200)
	}

	const x_signature = c.req.header("x-signature")
	const x_request_id = c.req.header("x-request-id")

	if (!x_signature || !x_request_id) {
		return c.json({ status: false }, 403)
	}

	const isSignatureValid = checkSignature({
		headers: { xsignature: x_signature, xrequestid: x_request_id },
		id: data.id,
	})
	if (!isSignatureValid) return c.json({ status: false }, 403)

	const payment_data = await getFeedbackPayment(data.id)
	if (!payment_data) {
		return c.json({ status: false }, 500)
	}
	const details: PaymentInfo = paymentDetails(payment_data)

	await sendWebhook(details)

	const email_res = await sendEmail({
		type: TEmailType.contacto,
		html: getResumenCompraTemplate(details),
	})
	if (!email_res) return c.json({ status: false }, 500)

	return c.json({ status: true }, 200)
}

export const checkSignature = ({
	headers,
	id,
}: {
	headers: { xsignature: string; xrequestid: string }
	id: string
}): boolean => {
	const { xsignature, xrequestid } = headers
	const signatureParts = xsignature.split(",")

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

	const manifest = `id:${id};request-id:${xrequestid};ts:${ts};`

	const hmac = crypto.createHmac("sha256", env.MPW_SECRET)
	hmac.update(manifest)

	const sha = hmac.digest("hex")

	if (sha !== hash) {
		return false
	}

	return true
}
