import { mailtrapClient, RECEIVER, SENDER_EMAIL } from "@/api/mailtrap"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { emailSchema } from "../models/email"
import { getWebMessageTemplate } from "../utils/email-templates"

export const emailRoute = new Hono().post("/", zValidator("json", emailSchema), async (c) => {
	const data = c.req.valid("json")

	const mailtrap_info = {
		from: { name: "Mailtrap test", email: SENDER_EMAIL },
		to: [{ email: RECEIVER }],
		subject: "no responder",
		category: "contacto",
		html: getWebMessageTemplate(data),
	}

	try {
		const isProd = process.env["NODE_ENV"] === "production"
		isProd
			? mailtrapClient.send(mailtrap_info).then(console.log).catch(console.error)
			: mailtrapClient.testing.send(mailtrap_info).then(console.log).catch(console.error)

		c.status(200)
		return c.json({ status: "ok" })
	} catch (err) {
		console.error("Caught an error: ", (err as Error).message)
		throw new Error("server error")
	}
})
