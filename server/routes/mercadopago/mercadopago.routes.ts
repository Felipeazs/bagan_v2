import { feedbackSchema } from "@/server/models/feedback"
import { usuarioSchema } from "@/server/models/usuario"
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
					schema: usuarioSchema,
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
					schema: feedbackSchema,
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
		403: {
			description: "Forbidden",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string(),
					}),
				},
			},
		},
		404: {
			description: "Payment Not Found",
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
