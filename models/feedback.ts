import { z } from "zod"

export const feedbackSchema = z.object({
	topic: z.enum(["payment", "merchant"]),
	id: z.string().trim().min(1, { message: "ingresa el código de compra" }),
})
