import { OpenAPIHono } from "@hono/zod-openapi"
import * as Sentry from "@sentry/bun"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"

import { CSP } from "@/CSP"
import env from "@/utils/env"
import { notFound, onError } from "stoker/middlewares"
import defaultHook from "stoker/openapi/default-hook"
import { logger } from "../middlewares/pino"
import { AppBindings } from "./types"

export function createRouter() {
	return new OpenAPIHono<AppBindings>({ strict: false, defaultHook })
}

export default function createApp() {
	const app = createRouter()

	app.use(logger())

	app.use(
		cors({
			origin: env.MP_REDIRECT,
		}),
	)

	Sentry.init({
		dsn: env.SENTRY_DSN,
		tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
		tracePropagationTargets: [`${env.MP_REDIRECT}/api`],
	})

	app.use(
		secureHeaders({
			xFrameOptions: false,
			xXssProtection: false,
			removePoweredBy: true,
			contentSecurityPolicy: env.NODE_ENV === "production" ? CSP : {},
		}),
	)
	app.use("*", async (c, next) => {
		c.res.headers.set("X-Powered-By", "Hono")
		await next()
	})

	app.get("/health", async (c) => {
		c.status(200)
		return c.json("ok")
	})

	app.onError(onError)
	app.notFound(notFound)

	return app
}
