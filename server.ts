import { Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/bun"
import { readFile } from "node:fs/promises"
import { mercadoPagoRoute } from "./controller/mercadopago"
import { emailRoute } from "./controller/contacto"
import { stripeRoute } from "./controller/stripe"

const isProd = process.env["NODE_ENV"] === "production"
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

const app = new Hono()
app.use(cors())

// UN-COMMENT these lines when you supply a db connection string
app.use("*", async (c, next) => {
	c.res.headers.set("X-Powered-By", "Hono")
	await next()
})

const apiRoutes = app
	.basePath("/api")
	.route("/contacto", emailRoute)
	.route("/mercado-pago", mercadoPagoRoute)
	.route("/stripe", stripeRoute)

app.get("/health", async (c) => {
	c.status(200)
	return c.json("ok")
})

export type ApiRoutes = typeof apiRoutes

app.use("/assets/*", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/apple-touch-icon.png", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/favicon-32x32.png", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/favicon-16x16.png", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/site.webmanifest", serveStatic({ root: isProd ? "build/" : "./" }))
app.get("/*", (c) => c.html(html))

console.log("server up and running")

export default {
	port: process.env.PORT || 4000,
	hostname: "0.0.0.0",
	fetch: app.fetch,
}
