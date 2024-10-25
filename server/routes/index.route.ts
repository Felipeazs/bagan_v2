import { createRoute } from "@hono/zod-openapi"
import { jsonContent } from "stoker/openapi/helpers"
import { createRouter } from "../lib/create-app"

import * as HttpStatusCode from "stoker/http-status-codes"
import { createMessageObjectSchema } from "stoker/openapi/schemas"

const router = createRouter().openapi(
	createRoute({
		method: "get",
		path: "/",
		tags: ["Index"],
		responses: {
			[HttpStatusCode.OK]: jsonContent(
				createMessageObjectSchema("Model Hono API"),
				"Index API",
			),
		},
	}),
	(c) => {
		return c.json({ message: "hola Openapi API" }, HttpStatusCode.OK)
	},
)

export default router
