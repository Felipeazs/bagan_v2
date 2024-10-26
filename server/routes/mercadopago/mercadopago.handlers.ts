import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes"
import crypto from "node:crypto"

import { Comprador } from "@/models/comprador"
import { PaymentInfo } from "@/models/types"
import { mercadoPagoClient } from "@/server/lib/mercadopago"
import { AppRouteHandler } from "@/server/lib/types"
import { TProducto } from "@/server/models/producto"
import { TUsuario } from "@/server/models/usuario"
import { Payment, Preference } from "mercadopago"
import { FeedbackRoute, PreferenceRoute } from "./mercadopago.routes"
import { HTTPException } from "hono/http-exception"
import { sendWebhookMessage } from "@/api/discord"
import { mailtrapClient } from "@/api/mailtrap"
import env from "@/utils/env"

export const preferenceId: AppRouteHandler<PreferenceRoute> = async (c) => {
	const comprador = c.req.valid("json")

	try {
		const prefDetails = setPreferenceDetails(comprador)

		const preference = new Preference(mercadoPagoClient)

		const pref_body = createBody(prefDetails)
		const res = await preference.create({
			body: pref_body,
		})

		if (res.api_response.status === 201) {
			return c.json({ prefId: res.id! }, 201)
		} else {
			return c.json({ message: "invalid parameters" }, 400)
		}
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

	if (type != "payment") {
		c.status(200)
		return c.json({ message: `no ${type} info` })
	}

	const x_signature = c.req.header("x-signature")
	const x_request_id = c.req.header("x-request-id")

	if (!x_signature || !x_request_id) {
		c.status(404)
		return c.json({ message: "Invalid webhook signature" })
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

	const manifest = `id:${data.id};request-id:${x_request_id};ts:${ts};`

	const { NODE_ENV, NM_MAILTRAP_FROM, NM_MAILTRAP_RECEIVER, MPW_SECRET } = env

	const hmac = crypto.createHmac("sha256", MPW_SECRET)
	hmac.update(manifest)

	const sha = hmac.digest("hex")

	if (sha !== hash) {
		c.status(404)
		return c.json({ message: "Invalid webhook signature" })
	}

	try {
		const payment = new Payment(mercadoPagoClient)
		const payment_data = await payment.get({ id: data.id })

		if (!payment_data) {
			c.status(404)
			return c.json({ message: "No payment data created" })
		}

		const details: PaymentInfo = paymentDetails(payment_data)
		let compras: { name: string; value: string }[] = []
		details.additional_info?.items?.forEach((i) => {
			compras.push({
				name: i.title,
				value: `$${i.unit_price.toLocaleString("es-Cl")} x ${i.quantity}\n${i.description}`,
			})
		})

		await sendWebhookMessage({
			title: details.id?.toString() ?? "",
			description: "Revisa ventas@bagan.cl para ver los detalles",
			content: "Nueva compra",
			fields: [
				...compras,
				{
					name: "Contacto",
					value: `${details.payer.name}\n${details.payer.email}\n+56 ${details.payer.phone.number}`,
				},
				{
					name: "Dirección",
					value: `${details.shipments.street_name} ${details.shipments.street_number}, ${details.shipments.apartment ? "casa/depto: " + details.shipments.apartment + ", " : ""} ${details.shipments.city_name}, ${details.shipments.state_name}`,
				},
			],
		})

		const mailtrap_info = {
			from: { name: "No responder", email: NM_MAILTRAP_FROM },
			to: [{ email: NM_MAILTRAP_RECEIVER }],
			subject: `Nueva compra: ${details.id}`,
			category: "venta",
			html: getResumenCompraTemplate(details),
		}

		const isProd = NODE_ENV === "production"

		if (isProd) {
			mailtrapClient.send(mailtrap_info)
		} else {
			const test_inbox = await mailtrapClient.testing.inboxes.getList()

			if (test_inbox && test_inbox[0].sent_messages_count === 100) {
				console.log("test email inbox is full")
			} else if (test_inbox) {
				mailtrapClient.testing.send(mailtrap_info)
			}
		}

		return c.json({ message: "feedback email sended to Bagan!" }, 200)
	} catch (err) {
		throw new HTTPException(500, {
			message: "Server error Sending MercadoPago Feedback",
			cause: err,
		})
	}
}

const setPreferenceDetails = (usuario: TUsuario): TUsuario => {
	usuario.items.forEach((p) => {
		const producto = store.find((s) => s.id === p.id) as TProducto

		if (!producto) return

		let tomate = 0
		let pimenton = 0
		let pesto = 0

		p.details.forEach((d) => {
			if (d === "tomate orégano") tomate++
			else if (d === "pimentón rojo") pimenton++
			else pesto++
		})

		p.unit_price = producto.unit_price
		p.description = [
			`Tomate orégano (${tomate})`,
			`Pimentón rojo (${pimenton})`,
			`Pesto albahaca (${pesto})`,
		].join(", ")
		p.category_id = "alimentos"
	})

	return usuario
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
		notification_url: `${process.env.MP_REDIRECT}/api/mercadopago/feedback`,
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

const getResumenCompraTemplate = (details: PaymentInfo) => {
	let table: string[] = []
	details.additional_info.items?.forEach((i) => {
		table = [
			...table,
			`
        <tr style="border-bottom: 1px solid #ddd text-align: center; vertical-align: 0q;">
            <td>${i.title}</td>
            <td class="descripcion" style="display:flex; flex-direction:column; justify-items: center; align-items: center; width: 190px;">
                ${i
					.description!.split(", ")
					.map((d) => `<div>${d}</div>`)
					.join("")}
            </td>
            <td style="text-align: center">${i.quantity}</td>
        </tr>
        `,
		]
	})

	return `
		<!DOCTYPE >
		<html lang="en-US">
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<style>
				@media (max-width: 430px) {
					.contacto,
					.resumen {
						font-size: 11px;
					}

					h2 {
						text-align: center;
						font-size: 15px;
					}

					table {
						font-size: 11px;
						max-width: 90%;
					}

					.bagan {
						width: 250px;
					}

					.mensaje-texto {
						font-size: 13px;
					}

					.descripcion {
						width: 130px;
						font-size: 11px;
					}
				}
			</style>

			<body
				style="font-family: Verdana; display: flex; flex-direction: column; justify-items: center; align-items: center;">
				<a href="https://bagan.cl">
					<img
						class="bagan"
						style="width: 500px;"
						src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,q_auto,c_crop,g_auto,h_500,w_1100/v1/Bagan/naomdbo6nhkvhhv85tal" />
				</a>
				<div class="mensaje" style="text-align: center; padding: 5px;">
					<h2 style="text-align: center;">Nueva compra registrada!</h2>
					<h3>${details.id}</h3>
					<div
						class="caja"
						style="max-width: 600px; background: #F9B00E; padding: 25px 10px; border-radius: 5px;">
						<div
							class="mensaje-caja"
							style="border: 2px solid black; border-radius: 5px; display: flex; flex-direction: column; justify-items: center; align-items: center; background: white;">
							<strong>Resumen</strong>
							<div
								class="resumen"
								style="display: flex; flex-direction: column; justify-items: center; align-items: center; font-size: 13px; padding: 20px 10px; text-align: center; width: 100%;">
								<table
									style="font-size: 13px; max-width: 80%; border-collapse: collapse;">
									<tr>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											fecha:
										</td>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											${details.date_approved?.split("T")[0]}
										</td>
									</tr>
									<tr>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											status:
										</td>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											${details.status}
										</td>
									</tr>
									<tr>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											subtotal:
										</td>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											$${details.transaction_amount?.toLocaleString("es-Cl")}
										</td>
									</tr>
									<tr>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											envío:
										</td>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											$${details.shipping_amount?.toLocaleString("es-Cl")}
										</td>
									</tr>
									<tr>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											total:
										</td>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											$${details.total_paid_amount?.toLocaleString("es-Cl")}
										</td>
									</tr>
									<tr>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											método de pago:
										</td>
										<td
											style="max-width: 200px; text-align: end; padding: 0px 5px;">
											Mercado Pago
										</td>
									</tr>
								</table>
							</div>
							<hr style="width: 80%; border-top: 1px solid #ddd" />
							<strong>Productos comprados</strong>
							<table
								style="font-size: 13px; max-width: 80%; border-collapse: collapse; margin: 20px;">
								<tr style="border-bottom:1px solid #ddd">
									<th>item</th>
									<th>variedades</th>
									<th>cantidad</th>
								</tr>
								${table.join("")}
							</table>
							<div
								class="contacto"
								style="display: flex; flex-direction: column; justify-items: center; align-items: center; font-size: 13px; padding: 20px 10px; text-align: center; width: 100%;">
								<strong>contacto</strong>
								<table
									style="font-size: 13px; max-width: 80%; border-collapse: collapse;">
									<tbody>
										<tr>
											<td
												style="max-width: 200px; text-align: end; padding: 0px 5px;">
												nombre:
											</td>
											<td
												style="max-width: 200px; text-align: end; padding: 0px 5px;">
												${details.payer.name}
											</td>
										</tr>
										<tr>
											<td
												style="max-width: 200px; text-align: end; padding: 0px 5px;">
												rut:
											</td>
											<td
												style="max-width: 200px; text-align: end; padding: 0px 5px;">
												${
													details.payer.identification.number
														? details.payer.identification.number
														: details.payer.identification.id
												}
											</td>
										</tr>
										<tr style="vertical-align: 0q;">
											<td
												style="max-width: 200px; text-align: end; padding: 0px 5px;">
												email:
											</td>
											<td
												style="display: flex; flex-direction: column; justify-items: end; align-items: end;">
												<span>${details.payer.email?.split("@")[0]}</span>
												<span>@${details.payer.email?.split("@")[1]}</span>
											</td>
										</tr>
										<tr>
											<td
												style="max-width: 200px; text-align: end; padding: 0px 5px;">
												teléfono:
											</td>
											<td
												style="max-width: 200px; text-align: end; padding: 0px 5px;">
												+56 ${details.payer.phone.number?.substring(0, 1)}
												${details.payer.phone.number?.substring(1, 5)}
												${details.payer.phone.number?.substring(5, 9)}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<hr style="width: 80%; border-top: 1px solid #ddd" />
							<div
								class="contacto"
								style="display: flex; flex-direction: column; justify-items: center; align-items: center; font-size: 13px; padding: 20px 10px; text-align: center; width: 100%;">
								<strong>despacho</strong>
								<span
									>${details.shipments.street_name}
									${details.shipments.street_number},
									${details.shipments.apartment ? "depto:" + details.shipments.apartment + "," : ""}
									${details.shipments.city_name},
									${details.shipments.state_name}</span
								>
							</div>
						</div>
					</div>
					<div class="footer" style="color: #c2c2c2; font-size: 13px; text-align: end;">
						<span>&#169; Up Foods</span> |
						<span>Pen&#771;a 459, Curico&#769;, Chile | CP: 3341861</span>
					</div>
				</div>
			</body>
		</html>
	`
}
