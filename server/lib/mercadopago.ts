import { HTTPException } from "hono/http-exception"
import MercadoPagoConfig, { Payment, Preference } from "mercadopago"
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes"
import {
	PreferenceRequest,
	PreferenceResponse,
} from "mercadopago/dist/clients/preference/commonTypes"

import * as HttpStatusPhrases from "stoker/http-status-phrases"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const mercadoPagoClient = new MercadoPagoConfig({
	accessToken: process.env["MP_ACCESS_TOKEN"]!,
})

export const createPreference = async (
	pref_body: PreferenceRequest,
): Promise<PreferenceResponse | undefined> => {
	try {
		const preference = new Preference(mercadoPagoClient)

		const res = await preference.create({
			body: pref_body,
		})

		if (res.api_response.status !== 201) {
			console.error({
				status: res.api_response.status,
				headers: res.api_response.headers,
			})
			return
		}

		return res
	} catch (err) {
		throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
			message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
			cause: err,
		})
	}
}

export const getFeedbackPayment = async (id: string): Promise<PaymentResponse | undefined> => {
	try {
		const payment = new Payment(mercadoPagoClient)
		const res = await payment.get({ id: id })

		if (res.api_response.status !== 200) {
			console.error({
				status: res.api_response.status,
				headers: res.api_response.headers,
			})
			return
		}

		return res
	} catch (err) {
		throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
			message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
			cause: err,
		})
	}
}
