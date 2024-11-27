import { AppRouteHandler } from "@/server/lib/types"
import crypto from "node:crypto"
import { FeedbackRoute } from "./pago.routes"
import { TFeedback } from "@/server/models/feedback"
import * as HttpStatusCode from "stoker/http-status-codes"
import { Context } from "hono"
import env from "@/utils/env"

export const feedback: AppRouteHandler<FeedbackRoute> = async (c) => {
	const feedbackBody = c.req.valid("json")
	const pago = c.req.param()

	let validationProcess
	switch (pago.tipo) {
		case "mercadopago":
			validationProcess = mercadopago
			break
		case "ventipay":
			validationProcess = ventipay
			break
		default:
			return c.json(HttpStatusCode.INTERNAL_SERVER_ERROR)
	}

	//validate webhook
	const isValid = validationProcess(feedbackBody, c)
	console.log("is valid:", isValid)

	return c.json(HttpStatusCode.OK)
}

const mercadopago = (data: TFeedback, c: Context) => {
	console.log("validating mp")
	console.log(data)

	return
}
const ventipay = (data: TFeedback, c: Context) => {
	console.log("validating ventipay")
	console.log(data)

	const venti_signature = c.req.header("venti-signature")
	console.log(venti_signature)
	const signatureParts = venti_signature!.split(",")

	let ts
	let hash
	signatureParts.forEach((part) => {
		const [key, value] = part.split("=")
		if (key && value) {
			const trimmedKey = key.trim()
			const trimmedValue = value.trim()
			if (trimmedKey === "t") {
				ts = trimmedValue
			} else if (trimmedKey === "v1") {
				hash = trimmedValue
			}
		}
	})

	const manifest = `${ts}.${data.data}`

	console.log(manifest)

	const hmac = crypto.createHmac("sha256", env.VENTIPAY_WEBHOOK_SECRET)
	hmac.update(manifest)

	const sha = hmac.digest("hex")

	if (sha !== hash) {
		return false
	}

	return true

	return
}
