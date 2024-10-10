// models/Todo.ts
import { z } from "zod"

const Todo = z.object({
	id: z.number().int(),
	title: z.string(),
	description: z.string(),
	deadline: z.date(),
})

type Todo = z.infer<typeof Todo>

export default Todo
