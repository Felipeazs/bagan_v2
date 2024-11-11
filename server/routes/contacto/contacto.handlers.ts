import { prepareContactoWebhook, sendWebhookMessage } from "@/server/lib/discord"
import { sendEmail, TEmailType } from "@/server/lib/mailtrap"
import { AppRouteHandler } from "@/server/lib/types"
import { getNewsletterTemplate, getWebMessageTemplate } from "@/server/utils/email-templates"
import { ContactoRoute, NewsletterRoute } from "./contacto.routes"

export const contacto: AppRouteHandler<ContactoRoute> = async (c) => {
	const data = c.req.valid("json")

	try {
		const webhook_data = prepareContactoWebhook(data)

		await sendWebhookMessage(webhook_data)

		await sendEmail({ type: TEmailType.contacto, html: getWebMessageTemplate(data) })

		return c.json({ status: "ok" }, 200)
	} catch (err) {
		console.error("Caught an error at /contacto", (err as Error).message)
		throw new Error("server error")
	}
}

export const newsletter: AppRouteHandler<NewsletterRoute> = async (c) => {
	const usuario = c.req.valid("json")

	await sendEmail({ type: TEmailType.newsletter, html: getNewsletterTemplate(usuario) })

	return c.json({ status: "ok" }, 200)
}
