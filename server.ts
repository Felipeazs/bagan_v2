import * as Sentry from "@sentry/bun"
import { OpenAPIHono } from "@hono/zod-openapi"
import { serveStatic } from "hono/bun"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { readFile } from "node:fs/promises"
import { app as EmailRoute } from "./controller/contacto"
// import { mercadoPagoRoute } from "./controller/mercadopago"
import { swaggerUI } from "@hono/swagger-ui"
import { CSP } from "./CSP"

const NODE_ENV = process.env["NODE_ENV"]!
export const isProd = NODE_ENV === "production" || NODE_ENV === "testing"
let html = await readFile(isProd ? "build/index.html" : "index.html", "utf8")

if (!isProd) {
	// Inject Vite client code to the HTML
	html = html.replace(
		"<head>",
		`
    <script type="module">
        import RefreshRuntime from "/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
    </script>
    <script type="module" src="/@vite/client"></script>
    `,
	)
}

process.on("uncaughtException", (err) => {
	console.log("UNCAUGHT EXCEPTION! 💣 Shutting down...")
	console.log(err.name, err.message)
	process.exit(1)
})

const app = new OpenAPIHono()

app.use(
	cors({
		origin: [
			"https://*.bagan.cl",
			isProd ? process.env["VITE_STRAPI_URL"]! : "http://localhost:1337",
		],
	}),
)
app.use(logger())
Sentry.init({
	dsn: process.env["SENTRY_DSN"],
	tracesSampleRate: isProd ? 0.1 : 1.0,
})

app.use(
	secureHeaders({
		xFrameOptions: false,
		xXssProtection: false,
		removePoweredBy: true,
		contentSecurityPolicy: CSP,
	}),
)
app.use("*", async (c, next) => {
	c.res.headers.set("X-Powered-By", "Hono")
	await next()
})

app.doc("/doc", {
	openapi: "3.1.0",
	info: {
		version: "1.0.0",
		title: "Bagán! API",
	},
})

app.get("/ui", swaggerUI({ url: "/doc" }))

app.use("/assets/*", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/apple-touch-icon.png", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/favicon-32x32.png", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/favicon-16x16.png", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/site.webmanifest", serveStatic({ root: isProd ? "build/" : "./" }))
app.get("/*", (c) => c.html(html))

// app.route("/contacto", emailRoute).route("/mercado-pago", mercadoPagoRoute)

const apiRoutes = app.route("/contacto", EmailRoute)

app.get("/health", async (c) => {
	c.status(200)
	return c.json("ok")
})

export type ApiRoutes = typeof apiRoutes

console.log(`server up and running\nmode: ${NODE_ENV}`)

export default {
	port: process.env.PORT || 4000,
	hostname: "0.0.0.0",
	fetch: app.fetch,
}
