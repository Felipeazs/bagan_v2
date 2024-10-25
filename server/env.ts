import dotenv from "dotenv"
import path from "path"
import { z, ZodError } from "zod"

dotenv.config({
	path: path.resolve(process.cwd(), process.env.NODE_ENV === "test" ? ".env.test" : ".env"),
})

const EnvSchema = z
	.object({
		NODE_ENV: z.string().default("development"),
		PORT: z.coerce.number().default(9999),
		LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
		// DATABASE_URL: z.string().url(),
		// DATABASE_AUTH_TOKEN: z.string().optional(),
	})
	.superRefine((input, ctx) => {
		if (input.NODE_ENV === "production") {
			ctx.addIssue({
				code: z.ZodIssueCode.invalid_type,
				expected: "string",
				received: "undefined",
				path: ["DATABASE_AUTH_TOKEN"],
				message: "Must be set when NODE_ENV is 'production'",
			})
		}
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
