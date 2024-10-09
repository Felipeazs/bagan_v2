import { z } from 'zod'

export const productoSchema = z.object({
	id: z.string(),
	title: z.string(),
	picture_url: z.string(),
	description: z.string(),
	quantity: z.number().int().min(1, { message: 'ingrese al menos 1 producto' }),
	unit_price: z.number(),
	category_id: z.string().optional(),
	external_reference: z.string().optional(),
	details: z.array(
		z.enum(['pimentón rojo', 'pesto albahaca', 'tomate orégano'], {
			message: 'elige la variedad del paté',
		}),
	),
	weight: z
		.number()
		.min(750, { message: 'El item no puede pesar menos de 750 gr' })
		.max(6000, { message: 'Si deseas comprar al por mayor, contáctate con nosotros!' }),
})

export type Producto = z.infer<typeof productoSchema>
