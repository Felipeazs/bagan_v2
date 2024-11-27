import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes"

import env from "@/utils/env"
import { PreferenceRequest } from "mercadopago/dist/clients/preference/commonTypes"
import { TPago } from "../models/pago"
import { PaymentInfo } from "../types"

export const createPreferenceBody = (data: TPago): PreferenceRequest => {
	const checkout_id = generateRandom16CharacterString()

	const payer_data = {
		payer: {
			name: data.nombre + " " + data.apellido,
			email: data.email,
			phone: {
				number: data.telefono,
			},
			identification: {
				type: "rut",
				number: data.rut,
			},
			address: {
				street_name: data.direccion.calle,
				street_number: data.direccion.numero,
			},
		},
		shipments: {
			mode: "not_specified",
			cost: data.envio,
			receiver_address: {
				street_name: data.direccion.calle,
				street_number: +data.direccion.numero,
				city_name: data.direccion.comuna,
				state_name: data.direccion.region,
				apartment: data.direccion.depto,
				country_name: "Chile",
			},
		},
		items: data.items,
		auto_return: "approved",
		back_urls: {
			success: env.MP_REDIRECT,
			pending: env.MP_REDIRECT,
			failure: env.MP_REDIRECT,
		},
		external_reference: checkout_id,
		statement_descriptor: "Bagán!",
		notification_url: `${env.MP_REDIRECT}/api/mercadopago/compra/feedback`,
		payment_methods: {
			excluded_payment_methods: [
				{
					id: "diners",
				},
				{
					id: "amex",
				},
			],
			excluded_payment_types: [
				{
					id: "ticket",
				},
			],
			installments: 12,
		},
		binary_mode: true,
	}

	return payer_data
}

export const paymentDetails = (data: PaymentResponse): PaymentInfo => {
	return {
		id: data.id,
		date_approved: data.date_approved,
		status: data.status,
		payment_method_id: data.payment_method_id,
		transaction_amount: data.transaction_amount,
		shipping_amount: data.shipping_amount,
		total_paid_amount: data.transaction_details?.total_paid_amount ?? 0,
		external_reference: data.external_reference,
		additional_info: {
			items: data.additional_info?.items,
		},
		payer: {
			name: `${data.additional_info?.payer?.first_name}`,
			email: data.payer?.email,
			phone: {
				number: data.additional_info?.payer?.phone?.number,
			},
			identification: {
				id: data.payer?.id,
				type: data.payer?.identification?.type,
				number: data.payer?.identification?.number,
			},
		},
		shipments: {
			street_name: data?.additional_info?.payer?.address?.street_name,
			city_name: data.additional_info?.shipments?.receiver_address?.city_name,
			street_number: data?.additional_info?.payer?.address?.street_number,
			state_name: data?.additional_info?.shipments?.receiver_address?.state_name,
			apartment: data.additional_info?.shipments?.receiver_address?.apartment,
		},
	}
}

export function generateRandom16CharacterString() {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	let result = ""
	for (let i = 0; i < 16; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	return result
}

export const store = [
	{
		id: "2usiygy4ongwpaw3vnh",
		title: "Tripack",
		description: "precio unitario: $4.100",
		unit_price: 12000,
		image: [
			"https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/w9bnssigaeufvajiluwj",
		],
	},
	{
		id: "qrctsu7lpq4okqikubm",
		title: "Sixpack",
		description: "precio unitario: $4.100",
		unit_price: 20000,
		image: [
			"https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/lvbe5zhkzzunlgfyh68d",
		],
	},
]
