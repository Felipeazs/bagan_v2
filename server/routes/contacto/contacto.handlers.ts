import { sendWebhook } from "@/server/lib/discord"
import { sendEmail, TEmailType } from "@/server/lib/mailtrap"
import { AppRouteHandler } from "@/server/lib/types"
import { getNewsletterTemplate, getWebMessageTemplate } from "@/server/utils/email-templates"
import { ContactoRoute, NewsletterRoute } from "./contacto.routes"
import { TContacto } from "@/server/models/email"

export const contacto: AppRouteHandler<ContactoRoute> = async (c) => {
	const data = c.req.valid("json") as TContacto

	await sendWebhook(data)

	const email = await sendEmail({
		type: TEmailType.contacto,
		html: getWebMessageTemplate(data),
	})
	if (!email) return c.json({ status: false }, 500)

	return c.json({ status: true }, 200)
}

export const newsletter: AppRouteHandler<NewsletterRoute> = async (c) => {
	const usuario = c.req.valid("json")

	const email_res = await sendEmail({
		type: TEmailType.newsletter,
		html: getNewsletterTemplate(usuario),
	})
	if (!email_res) return c.json({ status: false }, 500)

	return c.json({ status: true }, 200)
}
