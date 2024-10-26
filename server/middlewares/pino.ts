import env from "@/utils/env"
import { pinoLogger } from "hono-pino"

export function logger() {
	if (env.NODE_ENV === "production") {
		return pinoLogger({
			pino: { level: "info" },
		})
	}

	return pinoLogger({
		pino: {
			transport: {
				target: "pino-pretty",
			},
			level: env.LOG_LEVEL || "info",
		},
		http: {
			responseTime: false,
			reqId: () => crypto.randomUUID(),
			onResBindings: (c) => {
				if (c.req.path.startsWith("/api")) {
					return {
						res: {
							status: c.res.status,
							headers: c.res.headers,
						},
					}
				} else {
					return {
						res: undefined,
					}
				}
			},
			onReqBindings: (c) => {
				if (c.req.path.startsWith("/api")) {
					return {
						req: {
							url: c.req.path,
							method: c.req.method,
						},
					}
				} else {
					return {
						req: {
							url: c.req.path,
						},
					}
				}
			},
		},
	})
}
