import { EmbedBuilder, WebhookClient } from "discord.js"
import { IWebhook, PaymentInfo } from "../types"
import env, { isProd } from "@/utils/env"
import { TContacto } from "../models/email"

export const webhookClient = new WebhookClient({
	url: env.WEBHOOK_URL,
})

export const sendWebhookMessage = async (webhook: IWebhook) => {
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
}

export function prepareContactoWebhook(data: TContacto): IWebhook {
	return {
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

export function prepareVentaWebhook(data: PaymentInfo): IWebhook {
	const compras = data.additional_info.items!.map((i) => {
		return {
			name: i.title,
			value: `$${i.unit_price.toLocaleString("es-Cl")} x ${i.quantity}\n${i.description}`,
		}
	})

	return {
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
					data.shipments.apartment ? "casa/depto: " + data.shipments.apartment + ", " : ""
				} ${data.shipments.city_name}, ${data.shipments.state_name}`,
			},
		],
	}
}
