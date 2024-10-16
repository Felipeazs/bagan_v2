import { IWebhook } from "@/models/types"
import { EmbedBuilder, WebhookClient } from "discord.js"

export const webhookClient = new WebhookClient({
	url: process.env["WEBHOOK_URL"]!,
})

export const sendWebhookMessage = async (webhook: IWebhook) => {
	const isProd = process.env.NODE_ENV === "production"
	const embeds = new EmbedBuilder({
		author: {
			name: isProd ? "Bagan!" : "Bagan! Dev",
			url: process.env["MP_REDIRECT"],
		},
		title: webhook.title,
		description: webhook.description,
		color: 0xf9b00e,
		fields: webhook.fields,
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
