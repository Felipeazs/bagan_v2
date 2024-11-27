import { feedbackSchema } from "@/server/models/feedback"
import { pagoSchema } from "@/server/models/pago"
import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCode from "stoker/http-status-codes"

export const pago = createRoute({
	path: "/pago",
	method: "post",
	tags: ["Pago"],
	request: {
		body: {
			description: "Pago content body",
			content: {
				"application/json": {
					schema: pagoSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatusCode.OK]: {
			description: "Pago ok response",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
						url: z.string(),
					}),
				},
			},
		},
		[HttpStatusCode.BAD_REQUEST]: {
			description: "Bad Request",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
						url: z.string().optional(),
					}),
				},
			},
		},
		[HttpStatusCode.INTERNAL_SERVER_ERROR]: {
			description: "Server Error",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
						url: z.string().optional(),
					}),
				},
			},
		},
	},
})

export const feedback = createRoute({
	path: "/pago/feedback/{tipo}",
	method: "post",
	tags: ["Pago"],
	request: {
		params: z.object({
			tipo: z.string(),
		}),
		body: {
			description: "Pago feedback",
			content: {
				"application/json": {
					schema: feedbackSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatusCode.OK]: {
			description: "Pago ok response",
		},
		[HttpStatusCode.BAD_REQUEST]: {
			description: "Bad Request",
		},
		[HttpStatusCode.INTERNAL_SERVER_ERROR]: {
			description: "Server Error",
		},
	},
})

export type PagoRoute = typeof pago
export type FeedbackRoute = typeof feedback
