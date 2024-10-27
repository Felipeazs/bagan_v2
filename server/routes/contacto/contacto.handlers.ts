import { sendWebhookMessage } from "@/server/lib/discord"
import { mailtrapClient } from "@/server/lib/mailtrap"
import { AppRouteHandler } from "@/server/lib/types"
import { getNewsletterTemplate, getWebMessageTemplate } from "@/server/utils/email-templates"
import env from "@/utils/env"
import { ContactoRoute, NewsletterRoute } from "./contacto.routes"

export const contacto: AppRouteHandler<ContactoRoute> = async (c) => {
	const data = c.req.valid("json")

	const { NODE_ENV, NM_MAILTRAP_FROM, NM_MAILTRAP_RECEIVER } = env

	const mailtrap_info = {
		from: { name: "No responder", email: NM_MAILTRAP_FROM },
		to: [{ email: NM_MAILTRAP_RECEIVER }],
		subject: "no responder",
		category: "contacto",
		html: getWebMessageTemplate(data),
	}

	try {
		// Sendind Webhook message
		await sendWebhookMessage({
			title: "mensaje:",
			description: data.mensaje,
			content: "Nuevo mensaje",
			fields: [
				{
					name: "contacto",
					value: `${data.nombre} ${data.apellido}\n${data.email}\n+56 ${data.telefono}`,
				},
			],
		})

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

		return c.json({ message: "Email sent" }, 200)
	} catch (err) {
		console.error("Caught an error at /contacto", (err as Error).message)
		throw new Error("server error")
	}
}

export const newsletter: AppRouteHandler<NewsletterRoute> = async (c) => {
	const usuario = c.req.valid("json")

	const { NODE_ENV, NM_MAILTRAP_FROM, NM_MAILTRAP_RECEIVER } = env

	const mailtrap_info = {
		from: { name: "No responder", email: NM_MAILTRAP_FROM },
		to: [{ email: NM_MAILTRAP_RECEIVER }],
		subject: "no responder",
		category: "newsletter",
		html: getNewsletterTemplate(usuario),
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

	return c.json({ message: "Email added to newsletter" }, 200)
}
