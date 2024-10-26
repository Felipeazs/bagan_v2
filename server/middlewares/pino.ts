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
				options: {
					colorize: true,
				},
			},
			level: env.LOG_LEVEL || "info",
		},
		http: {
			reqId: () => crypto.randomUUID(),
		},
	})
}
