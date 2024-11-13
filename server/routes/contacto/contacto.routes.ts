import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCode from "stoker/http-status-codes"

import { contactoSchema, newsletterSchema } from "@/server/models/email"

const base = "/contacto"

export const contacto = createRoute({
	method: "post",
	path: `${base}/message`,
	tags: ["Contacto"],
	request: {
		body: {
			description: "Send message contacto",
			content: {
				"application/json": {
					schema: contactoSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatusCode.OK]: {
			description: "OK Message Status",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
					}),
				},
			},
		},
		[HttpStatusCode.INTERNAL_SERVER_ERROR]: {
			description: "Internal Server Error",
			content: {
				"application/json": {
					schema: z.object({
						status: z.boolean(),
					}),
				},
			},
		},
	},
})

export const newsletter = createRoute({
	method: "post",
	path: `${base}/newsletter`,
	tags: ["Contacto"],
	request: {
		body: {
			description: "Add email to newsletter",
			content: {
				"application/json": {
					schema: newsletterSchema,
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
					}),
				},
			},
		},
	},
})

export type ContactoRoute = typeof contacto
export type NewsletterRoute = typeof newsletter
