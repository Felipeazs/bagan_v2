// Make sure to install the 'postgres' package
import env from "@/utils/env"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { codigos } from "./schema"

const queryClient = postgres(env.DATABASE_URL)

const db = drizzle({ client: queryClient, schema })

export default db

export const insertCodigoDB = async ({
	codigo,
	descripcion,
	valor,
}: {
	codigo: string
	descripcion: string
	valor: number
}) => {
	const res = await db.insert(codigos).values({
		codigo,
		descripcion,
		valor,
	})

    res

    return res
}
