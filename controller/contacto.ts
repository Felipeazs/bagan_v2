import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { env } from "hono/adapter"
import { z } from "zod"

import { sendWebhookMessage } from "@/api/discord"
import { mailtrapClient } from "@/api/mailtrap"
import { emailSchema } from "@/models/email"
import { getWebMessageTemplate } from "@/utils/email-templates"

export const app = new OpenAPIHono()

const contacto = createRoute({
	method: "post",
	path: "/",
	request: {
		body: {
			description: "Send message contacto",
			content: {
				"application/json": {
					schema: emailSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Status",
			content: {
				"application/json": {
					schema: z.object({
						status: z.string(),
					}),
				},
			},
		},
	},
})

app.openapi(contacto, async (c) => {
	const data = c.req.valid("json")

	const { NODE_ENV, NM_MAILTRAP_FROM, NM_MAILTRAP_RECEIVER } = env<{
		NODE_ENV: string
		NM_MAILTRAP_FROM: string
		NM_MAILTRAP_RECEIVER: string
	}>(c)

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
			title: data.mensaje,
			description: data.nombre,
			content: "Nuevo mensaje",
			fields: [
				{
					name: "contacto",
					value: `${data.email}\n+56 ${data.telefono}`,
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

		c.status(200)
		return c.json({ status: "ok" })
	} catch (err) {
		console.error("Caught an error at /contacto", (err as Error).message)
		throw new Error("server error")
	}
})
