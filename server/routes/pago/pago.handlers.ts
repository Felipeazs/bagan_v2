import { createPreference } from "@/server/lib/mercadopago"
import { AppRouteHandler } from "@/server/lib/types"
import { TPago } from "@/server/models/pago"
import { createPreferenceBody } from "@/server/utils/payment"
import { setPreferenceDetails } from "@/server/utils/preference"
import env from "@/utils/env"
import { HTTPException } from "hono/http-exception"
import MercadoPagoConfig from "mercadopago"
import * as HttpStatusCode from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import { PagoRoute } from "./pago.routes"

export const mercadoPagoClient = new MercadoPagoConfig({
	accessToken: env.MP_ACCESS_TOKEN,
})

export const pago: AppRouteHandler<PagoRoute> = async (c) => {
	const pagoBody = c.req.valid("json") as TPago

	if (!pagoBody) return c.json({ status: false, url: undefined }, HttpStatusCode.BAD_REQUEST)

	let paymentProcessor
	switch (pagoBody.mediospago) {
		case "mercadopago":
			paymentProcessor = createMercadopago
			break
		case "ventipay":
			paymentProcessor = createVentipay
			break
		case "fintoc":
			paymentProcessor = createFintoc
			break
		default:
			return c.json({ status: false, url: undefined }, HttpStatusCode.INTERNAL_SERVER_ERROR)
	}

	try {
		const res = await paymentProcessor(pagoBody)
		if (!res)
			return c.json({ status: false, url: undefined }, HttpStatusCode.INTERNAL_SERVER_ERROR)

		return c.json({ status: true, url: res }, 200)
	} catch (err) {
		throw new HTTPException(HttpStatusCode.INTERNAL_SERVER_ERROR, {
			message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
			cause: err,
		})
	}
}

const createMercadopago = async (data: TPago): Promise<string | undefined> => {
	const prefDetails = setPreferenceDetails(data)
	const preference_body = createPreferenceBody(prefDetails)

	const res = await createPreference(preference_body)
	if (!res) return

	const url_point = res?.init_point

	return url_point
}

const createVentipay = async (data: TPago): Promise<string | undefined> => {
	const url = "https://api.ventipay.com/v1/checkouts"
	const secret_key = btoa(env.VENTIPAY_SECRET_KEY + ":")
	const auth = `Basic ${secret_key}`

	const options = {
		method: "POST",
		headers: {
			"content-type": "application/json",
			authorization: auth,
		},
		body: JSON.stringify({
			currency: "clp",
			authorize: true,
			cancel_url_method: "get",
			success_url_method: "get",
			cancel_url: "https://dev.bagan.cl",
			success_url: "https://dev.bagan.cl",
			items: [{ unit_price: 15000, quantity: 1, name: "tripack" }],
			notfication_url: "https://dev.bagan.cl/api/feedback",
		}),
	}

	const res = await fetch(url, options)
	const json = await res.json()

	if (!json) return

	return json.url
}
const createFintoc = async (data: TPago): Promise<string | undefined> => {
	return
}
