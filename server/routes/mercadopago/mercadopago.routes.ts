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
		200: {
			description: "Successfuly created Preference Id",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
						data: z.string(),
					}),
				},
			},
		},
		400: {
			description: "Bad request",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
						data: z.string().optional(),
					}),
				},
			},
		},
		422: {
			description: "Unprocessable content",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
						data: z.string().optional(),
					}),
				},
			},
		},
		500: {
			description: "Server Error",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
						data: z.string().optional(),
					}),
				},
			},
		},
	},
})

export const feedback = createRoute({
	path: `${base}/compra/feedback`,
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
						status: z.boolean(),
					}),
				},
			},
		},
		400: {
			description: "Bad Request",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
					}),
				},
			},
		},
		403: {
			description: "Forbidden",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
					}),
				},
			},
		},
		404: {
			description: "Not Found",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
					}),
				},
			},
		},
		500: {
			description: "Server Error",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
						data: z.string().optional(),
					}),
				},
			},
		},
	},
})

export type PreferenceRoute = typeof preferenceId
export type FeedbackRoute = typeof feedback
