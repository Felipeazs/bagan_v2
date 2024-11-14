import { sendWebhook } from "@/server/lib/discord"
import { sendEmail } from "@/server/lib/mailtrap"
import { AppRouteHandler } from "@/server/lib/types"
import { TContacto } from "@/server/models/email"
import { getNewsletterTemplate, getWebMessageTemplate } from "@/server/utils/email-templates"
import { ContactoRoute, NewsletterRoute } from "./contacto.routes"
import { TEmailType } from "@/server/types"

export const contacto: AppRouteHandler<ContactoRoute> = async (c) => {
	const data = c.req.valid("json") as TContacto

	await sendWebhook(data)

	const email_content = {
		type: TEmailType.contacto,
		html: getWebMessageTemplate(data),
	}

	const email = await sendEmail(email_content)
	if (!email) return c.json({ status: false }, 500)

	return c.json({ status: true }, 200)
}

export const newsletter: AppRouteHandler<NewsletterRoute> = async (c) => {
	const usuario = c.req.valid("json")

	const email_content = {
		type: TEmailType.newsletter,
		html: getNewsletterTemplate(usuario),
	}

	const email_res = await sendEmail(email_content)
	if (!email_res) return c.json({ status: false }, 500)

	return c.json({ status: true }, 200)
}
