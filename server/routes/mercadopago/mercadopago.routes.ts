import { compradorSchema } from "@/models/comprador"
import { createRoute } from "@hono/zod-openapi"

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
		200: {
			description: "Successful response",
		},
	},
})

export type PreferenceRoute = typeof preferenceId
