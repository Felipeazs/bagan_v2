import devServer from "@hono/vite-dev-server"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import env from "./utils/env"

export default defineConfig({
	server: {
		port: env.PORT,
	},
	build: {
		outDir: "build",
		rollupOptions: {
			output: {
				manualChunks: {
					react: ["react"],
					"react-dom": ["react-dom"],
					"@tanstack/react-form": ["@tanstack/react-form"],
					"@tanstack/react-query": ["@tanstack/react-query"],
					"@tanstack/react-router": ["@tanstack/react-router"],
				},
			},
		},
	},
	plugins: [
		react(),
		TanStackRouterVite({
			routesDirectory: "./views/routes",
			generatedRouteTree: "./views/routeTree.gen.ts",
		}),
		devServer({
			entry: "app.ts",
			exclude: [
				/.*\.tsx?($|\?)/,
				/.*\.(s?css|less)($|\?)/,
				/.*\.(svg|png)($|\?)/,
				/^\/@.+$/,
				/^\/favicon\.ico$/,
				/^\/(public|assets|static)\/.+/,
				/^\/node_modules\/.*/,
			],
			injectClientScript: false,
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
})
