// Make sure to install the 'postgres' package
import env from "@/utils/env"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const queryClient = postgres(env.DATABASE_URL)

export default drizzle({ client: queryClient, schema })
