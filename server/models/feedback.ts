import { z } from "zod"

export const feedbackSchema = z.object({
	type: z.enum(["payment", "merchant"]),
	data: z.object({
		id: z.string(),
	}),
})
