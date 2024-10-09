import { defineConfig, type Config } from 'drizzle-kit'

export default defineConfig({
	schema: './db/schema/*',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DRIZZLE_DATABASE_URL!,
	},
} satisfies Config)
