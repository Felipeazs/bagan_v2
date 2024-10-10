import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const example = pgTable("example", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	items: text("items").array(),
	createdAt: timestamp("created_at").defaultNow(),
})

export const insertEjemploSchema = createInsertSchema(example, {
	title: z.string().min(3, { message: "el título debe tener al menos 3 letras" }),
	items: z.array(z.string().min(3, { message: "agrega un item" })),
})
export type TEjemplo = z.infer<typeof insertEjemploSchema>
