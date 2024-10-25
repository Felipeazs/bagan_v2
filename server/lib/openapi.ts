import { AppOpenAPI } from "./types"

import packageJSON from "../../package.json"
import { apiReference } from "@scalar/hono-api-reference"

export default function configureOpenAPI(app: AppOpenAPI) {
	app.doc("/doc", {
		openapi: "3.0.0",
		info: {
			version: packageJSON.version,
			title: "Openapi model API",
		},
	})

	app.get(
		"/reference",
		apiReference({
			defaultHttpClient: {
				targetKey: "javascript",
				clientKey: "fetch",
			},
			spec: {
				url: "/doc",
			},
		}),
	)
}
