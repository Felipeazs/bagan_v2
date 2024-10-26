import { Items } from "mercadopago/dist/clients/commonTypes"

export interface IWebhook {
	title: string
	description: string
	content: string
	fields?: {
		name: string
		value: string
	}[]
}

export type PaymentInfo = {
	id: number | undefined
	date_approved: string | undefined
	status: string | undefined
	payment_method_id: string | undefined
	transaction_amount: number | undefined
	shipping_amount: number | undefined
	total_paid_amount: number | undefined
	external_reference: string | undefined
	additional_info: {
		items: Items[] | undefined
	}
	payer: {
		name: string | undefined
		email: string | undefined
		phone: {
			number: string | undefined
		}
		identification: {
			id: string | undefined
			type: string | undefined
			number: string | undefined
		}
	}
	shipments: {
		street_name: string | undefined
		city_name: string | undefined
		street_number: string | undefined
		state_name: string | undefined
		apartment: string | undefined
	}
}
