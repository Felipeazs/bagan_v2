import { z } from "zod"

export const feedbackSchema = z.object({
	type: z.string(),
	data: z.object({
		id: z.string().optional(),
	}),
	id: z.string().optional(),
	live: z.boolean().optional(),
})

export type TFeedback = z.infer<typeof feedbackSchema>
