import { feedbackSchema } from "@/server/models/feedback"
import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCode from "stoker/http-status-codes"

const tags = ["Mercado pago"]
const base = "/mercadopago"

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
		[HttpStatusCode.OK]: {
			description: "Feedback response after payment",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
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
					}),
				},
			},
		},
		[HttpStatusCode.FORBIDDEN]: {
			description: "Forbidden",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
					}),
				},
			},
		},
		[HttpStatusCode.UNPROCESSABLE_ENTITY]: {
			description: "Unprocessable entity",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
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
						data: z.string().optional(),
					}),
				},
			},
		},
	},
})

export type PreferenceRoute = typeof preferenceId
export type FeedbackRoute = typeof feedback
