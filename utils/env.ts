import dotenv from "dotenv"
import path from "path"
import { z, ZodError } from "zod"

dotenv.config({
	path: path.resolve(process.cwd(), process.env.NODE_ENV === "test" ? ".env.test" : ".env"),
})

const EnvSchema = z.object({
	NODE_ENV: z.string().default("development"),
	PORT: z.coerce.number().default(9999),
	LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
	NM_MAILTRAP_FROM: z.string().email(),
	NM_MAILTRAP_RECEIVER: z.string().email(),
	MT_API_KEY: z.string(),
	MT_ACCOUNT_ID: z.coerce.number(),
	MT_TEST_ID: z.coerce.number(),
	VITE_MP_PUBLIC_KEY: z.string(),
	MP_ACCESS_TOKEN: z.string(),
	MP_REDIRECT: z.string().url(),
	MPW_SECRET: z.string(),
	VITE_STRAPI_API_KEY: z.string(),
	VITE_STRAPI_URL: z.string().url(),
	SENTRY_DSN: z.string().url(),
	WEBHOOK_URL: z.string().url(),
})

export type Env = z.infer<typeof EnvSchema>

let env: Env

try {
	env = EnvSchema.parse(process.env)
} catch (e) {
	const error = e as ZodError
	console.error("❌ Invalid env:")
	console.error(error.flatten().fieldErrors)
	process.exit(1)
}

export default env
