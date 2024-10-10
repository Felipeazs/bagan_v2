import { Producto } from "../db/schema/productos"
import { Comprador } from "../db/schema/comprador"
import { PaymentInfo } from "../db/schema/types"
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes"

export const setPreferenceDetails = (comprador: Comprador): Comprador => {
	comprador.items.forEach((p) => {
		const producto = store.find((s) => s.id === p.id) as Producto

		let tomate = 0
		let pimenton = 0
		let pesto = 0

		p.details.forEach((d) => {
			if (d === "tomate orégano") tomate++
			else if (d === "pimentón rojo") pimenton++
			else pesto++
		})

		p.unit_price = producto!.unit_price
		p.description = [
			`Tomate orégano (${tomate})`,
			`Pimentón rojo (${pimenton})`,
			`Pesto albahaca (${pesto})`,
		].join(", ")
		p.category_id = "alimentos"
	})

	return comprador
}

export const createBody = (comprador: Comprador) => {
	const checkout_id = generateRandom16CharacterString()
	return {
		payer: {
			name: comprador.nombre + " " + comprador.apellido,
			email: comprador.email,
			phone: {
				number: comprador.telefono,
			},
			identification: {
				type: "rut",
				number: comprador.rut,
			},
			address: {
				street_name: comprador.direccion.calle,
				street_number: comprador.direccion.numero,
			},
		},
		shipments: {
			mode: "not_specified",
			cost: comprador.envio,
			receiver_address: {
				street_name: comprador.direccion.calle,
				street_number: +comprador.direccion.numero,
				city_name: comprador.direccion.comuna,
				state_name: comprador.direccion.region,
				apartment: comprador.direccion.depto,
				country_name: "Chile",
			},
		},
		items: comprador.items,
		auto_return: "approved",
		back_urls: {
			success: process.env.MP_REDIRECT,
			pending: process.env.MP_REDIRECT,
			failure: process.env.MP_REDIRECT,
		},
		external_reference: checkout_id,
		statement_descriptor: "Bagán!",
		notification_url: `${process.env.MP_REDIRECT}/api/mercado-pago/feedback`,
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
			name: data.additional_info?.payer?.first_name,
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
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	let result = ""
	for (let i = 0; i < 16; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	return result
}

export const store = [
	{
		id: "85euxvvlqfmj7ekgw5g",
		title: "Paté Vegetal",
		description: "Tomate Orégano",
		unit_price: 4000,
	},
	{
		id: "zjfa63ox2qgwkuxemn9",
		title: "Paté Vegetal",
		description: "Pesto Albahaca",
		unit_price: 4000,
	},
	{
		id: "xha2bkwjr5od7hzb84c",
		title: "Paté Vegetal",
		description: "Pimentón Rojo",
		unit_price: 4000,
	},
	{
		id: "2usiygy4ongwpaw3vnh",
		title: "Tripack",
		description: "precio unitario: $4.100",
		unit_price: 11000,
	},
	{
		id: "qrctsu7lpq4okqikubm",
		title: "Sixpack",
		description: "precio unitario: $4.100",
		unit_price: 20000,
	},
]
