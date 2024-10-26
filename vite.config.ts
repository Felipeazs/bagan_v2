// vite.config.ts
import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import devServer from "@hono/vite-dev-server"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import env from "./utils/env"

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: env.PORT, // change to a custom port
	},
	build: {
		outDir: "build", // change to 'build', explain later
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
			entry: "server.ts",
			exclude: [
				// We need to override this option since the default setting doesn't fit
				/.*\.tsx?($|\?)/,
				/.*\.(s?css|less)($|\?)/,
				/.*\.(svg|png)($|\?)/,
				/^\/@.+$/,
				/^\/favicon\.ico$/,
				/^\/(public|assets|static)\/.+/,
				/^\/node_modules\/.*/,
			],
			injectClientScript: false, // This option is buggy, disable it and inject the code manually
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
})
