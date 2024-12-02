import env from "@/utils/env"
import { pinoLogger } from "hono-pino"

export function logger() {
	return pinoLogger({
		pino: {
			transport: {
				target: "pino-pretty",
				options: {
					colorize: true,
				},
			},
			level: env.LOG_LEVEL || "info",
		},
		http: {
			responseTime: true,
			reqId: () => crypto.randomUUID(),
			onResBindings: (c) => {
				if (c.req.path.startsWith("/api")) {
					return {
						res: {
							status: c.res.status,
							["content-type"]: c.req.header("content-type"),
						},
					}
				} else {
					return {
						status: c.res.status,
					}
				}
			},
			onReqBindings: (c) => {
				if (c.req.path.startsWith("/api")) {
					return {
						req: {
							url: c.req.path,
							method: c.req.method,
							headers: {
								host: c.req.header("host"),
								["content-type"]: c.req.header("content-type"),
								["content-length"]: c.req.header("content-length"),
							},
							query: c.req.query,
							params: c.req.param,
						},
					}
				} else {
					return {
						url: c.req.path,
					}
				}
			},
		},
	})
}
