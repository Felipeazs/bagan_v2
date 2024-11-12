import MercadoPagoConfig, { Payment, Preference } from "mercadopago"
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes"
import {
	PreferenceRequest,
	PreferenceResponse,
} from "mercadopago/dist/clients/preference/commonTypes"

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

		if (res.api_response.status !== 200) return

		return res
	} catch (err) {
		console.log((err as Error).message)
		return
	}
}

export const getFeedbackPayment = async (id: string): Promise<PaymentResponse | undefined> => {
	try {
		const payment = new Payment(mercadoPagoClient)
		const res = await payment.get({ id: id })
		if (res.api_response.status !== 200) return

		return res
	} catch (err) {
		console.log((err as Error).message)
		return
	}
}
