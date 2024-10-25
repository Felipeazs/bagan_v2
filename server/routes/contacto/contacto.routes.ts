import { createRoute, z } from "@hono/zod-openapi"
import { createRouter } from "../../lib/create-app"

import { emailSchema } from "@/models/email"

const router = createRouter().openapi(
	createRoute({
		method: "get",
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
	}),
)

export default router
