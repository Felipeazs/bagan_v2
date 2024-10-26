import { createRoute, z } from "@hono/zod-openapi"
import { emailSchema } from "@/server/models/email"

export const contacto = createRoute({
	method: "post",
	path: "/contacto",
	tags: ["Contacto"],
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
			description: "Message Status",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string(),
					}),
				},
			},
		},
	},
})

export type ContactoRoute = typeof contacto
