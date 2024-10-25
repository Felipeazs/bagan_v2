// import { app as EmailRoute } from "./controller/contacto"
// import { mercadoPagoRoute } from "./controller/mercadopago"
import { serveStatic } from "hono/bun"
import { readFile } from "node:fs/promises"
import createApp from "./server/lib/create-app"
import configureOpenAPI from "./server/lib/openapi"
import index from "./server/routes/index.route"
import mercadopago from "./server/routes/mercadopago/mercadopago.index"
import env from "./utils/env"

export const isProd = env.NODE_ENV === "production" || env.NODE_ENV === "testing"
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

const app = createApp()

// app.route("/contacto", emailRoute).route("/mercado-pago", mercadoPagoRoute)
// const apiRoutes = app.route("/contacto", EmailRoute)

const routes = [index, mercadopago] as const

configureOpenAPI(app)

routes.forEach((route) => {
	app.route("/api", route)
})

app.use("/assets/*", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/apple-touch-icon.png", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/favicon-32x32.png", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/favicon-16x16.png", serveStatic({ root: isProd ? "build/" : "./" }))
app.use("/site.webmanifest", serveStatic({ root: isProd ? "build/" : "./" }))
app.get("/*", (c) => c.html(html))

export type ApiRoutes = (typeof routes)[number]
export default app

Bun.serve({
	port: env.PORT || 3000,
	fetch: app.fetch,
})
