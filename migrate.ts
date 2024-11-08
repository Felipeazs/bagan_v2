import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

import env from "./utils/env"

const migrationClient = postgres(env.DATABASE_URL, { max: 1 })
await migrate(drizzle(migrationClient), { migrationsFolder: "server/db/migrations" })
console.log("migration completed!")
