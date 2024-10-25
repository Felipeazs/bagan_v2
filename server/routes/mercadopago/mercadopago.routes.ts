import { compradorSchema } from "@/models/comprador"
import { createRoute, z } from "@hono/zod-openapi"

const tags = ["Mercado pago"]
const base = "/mercadopago"

export const preferenceId = createRoute({
	path: `${base}/create-preference`,
	method: "post",
	request: {
		body: {
			description: "Create Mercado Pago Preference ID",
			content: {
				"application/json": {
					schema: compradorSchema,
				},
			},
		},
	},
	tags,
	responses: {
		201: {
			description: "Successfuly created Preference Id",
			content: {
				"application/json": {
					schema: z.object({
						prefId: z.string(),
					}),
				},
			},
		},
		400: {
			description: "Invalid parameters",
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

export type PreferenceRoute = typeof preferenceId
