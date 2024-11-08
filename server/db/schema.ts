import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"

export const codigos = pgTable("codigos", {
	id: serial().primaryKey(),
	codigo: text("codigo").notNull(),
	descripcion: text("descripcion").notNull(),
	valor: integer().notNull(),
	createdAt: timestamp({ mode: "date" }).default(new Date()),
})

export const insertCodigosSchema = createInsertSchema(codigos).omit({
	id: true,
	createdAt: true,
})
