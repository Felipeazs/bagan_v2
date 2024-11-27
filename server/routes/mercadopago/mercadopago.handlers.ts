import crypto from "node:crypto"
import * as HttpStatusCodes from "stoker/http-status-codes"

import { sendWebhook } from "@/server/lib/discord"
import { sendEmail } from "@/server/lib/mailtrap"
import { getFeedbackPayment } from "@/server/lib/mercadopago"
import { AppRouteHandler } from "@/server/lib/types"
import { PaymentInfo, TEmailType } from "@/server/types"
import { getResumenCompraTemplate } from "@/server/utils/email-templates"
import { paymentDetails } from "@/server/utils/payment"
import env from "@/utils/env"
import { FeedbackRoute } from "./mercadopago.routes"

export const feedback: AppRouteHandler<FeedbackRoute> = async (c) => {
	const { data, type } = c.req.valid("json")

	if (type !== "payment") {
		return c.json({ status: false }, HttpStatusCodes.OK)
	}

	const x_signature = c.req.header("x-signature")
	const x_request_id = c.req.header("x-request-id")

	if (!x_signature || !x_request_id) {
		return c.json({ status: false }, HttpStatusCodes.FORBIDDEN)
	}

	const isSignatureValid = checkSignature({
		headers: { xsignature: x_signature, xrequestid: x_request_id },
		id: data.id!,
	})

	if (!isSignatureValid) return c.json({ status: false }, HttpStatusCodes.FORBIDDEN)

	const payment_data = await getFeedbackPayment(data.id!)
	if (!payment_data) return c.json({ status: false }, HttpStatusCodes.INTERNAL_SERVER_ERROR)

	const details: PaymentInfo = paymentDetails(payment_data)

	await sendWebhook(details)

	const email_content = {
		type: TEmailType.contacto,
		html: getResumenCompraTemplate(details),
	}

	const email_res = await sendEmail(email_content)
	if (!email_res) return c.json({ status: false }, HttpStatusCodes.INTERNAL_SERVER_ERROR)

	return c.json({ status: true }, HttpStatusCodes.OK)
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
