import { APIMessage, EmbedBuilder, WebhookClient } from "discord.js"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import * as HttpStatusCodes from "stoker/http-status-codes"

import env, { isProd } from "@/utils/env"
import { TContacto } from "../models/email"
import { IWebhook, PaymentInfo } from "../types"

export const webhookClient = new WebhookClient({
	url: env.WEBHOOK_URL,
})

export const sendWebhookMessage = async (webhook: IWebhook) => {
	try {
		const embeds = new EmbedBuilder({
			author: {
				name: isProd ? "Bagan!" : "Bagan! Dev",
				url: env.MP_REDIRECT,
			},
			title: webhook.title,
			description: webhook.description,
			fields: webhook.fields,
			color: 0xf9b00e,
		})

		const res = await webhookClient.send({
			content: webhook.content,
			username: isProd ? "Bagán!" : "Bagán! Dev",
			avatarURL:
				"https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,q_auto/v1/Bagan/idwslws7hovtx2cg18ko",
			embeds: [embeds],
		})

		return res
	} catch (err) {
		throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
			message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
			cause: err,
		})
	}
}

function isWebhook(data: TContacto | PaymentInfo): data is PaymentInfo {
	return "payer" in data
}

export async function sendWebhook(data: TContacto | PaymentInfo): Promise<APIMessage | undefined> {
	let webhook_info
	if (isWebhook(data)) {
		const compras = data.additional_info.items!.map((i) => {
			return {
				name: i.title,
				value: `$${i.unit_price.toLocaleString("es-Cl")} x ${i.quantity}\n${i.description}`,
			}
		})

		webhook_info = {
			title: data.id?.toString() ?? "",
			description: "Revisa ventas@bagan.cl para ver los detalles",
			content: "Nueva compra",
			fields: [
				...compras,
				{
					name: "Contacto",
					value: `${data.payer.name}\n${data.payer.email}\n+56 ${data.payer.phone.number}`,
				},
				{
					name: "Dirección",
					value: `${data.shipments.street_name} ${data.shipments.street_number}, ${
						data.shipments.apartment
							? "casa/depto: " + data.shipments.apartment + ", "
							: ""
					} ${data.shipments.city_name}, ${data.shipments.state_name}`,
				},
			],
		}
	} else {
		webhook_info = {
			title: "mensaje:",
			description: data.mensaje,
			content: "Nuevo mensaje",
			fields: [
				{
					name: "contacto",
					value: `${data.nombre} ${data.apellido}\n${data.email}\n+56 ${data.telefono}`,
				},
			],
		}
	}

	return await sendWebhookMessage(webhook_info)
}
