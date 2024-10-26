import { compradorSchema } from "@/models/comprador"
import { createRoute, z } from "@hono/zod-openapi"

const tags = ["Mercado pago"]
const base = "/mercadopago"

export const preferenceId = createRoute({
	path: `${base}/create-preference`,
	method: "post",
	tags,
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

export const feedback = createRoute({
	path: `${base}/feedback`,
	method: "post",
	tags,
	request: {
		body: {
			description: "Feedback content body",
			content: {
				"application/json": {
					schema: z.object({
						data: z.object({
							id: z.string(),
						}),
						type: z.string(),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: "Feedback response after payment",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string(),
					}),
				},
			},
		},
		422: {
			description: "No query params found",
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
export type FeedbackRoute = typeof feedback
