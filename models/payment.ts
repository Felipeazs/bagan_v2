import { z } from "zod"

export const paymentSchema = z.object({
	id: z.string().trim().min(1, { message: "ingresa el código de compra" }),
})
