import { z } from "zod"

export enum EID {
	tripack = "2usiygy4ongwpaw3vnh",
	sixpack = "qrctsu7lpq4okqikubm",
}

export enum ETitle {
	tripack = "Tripack",
	sixpack = "Sixpack",
	giftcard = "Giftcard",
}

export const productoSchema = z.object({
	id: z.enum([EID.tripack, EID.sixpack]),
	title: z.enum([ETitle.tripack, ETitle.sixpack, ETitle.giftcard]),
	picture_url: z.string().optional(),
	description: z.string(),
	quantity: z.number().int().min(1, { message: "ingrese al menos 1 producto" }),
	unit_price: z.number().int().min(12000, { message: "error precio unitario" }),
	category_id: z.string().optional(),
	external_reference: z.string().optional(),
	details: z
		.array(
			z.enum(["pimentón rojo", "pesto albahaca", "tomate orégano", "giftcard"], {
				message: "Sólo puedes elegir entre las variedades disponibles",
			}),
		)
		.min(3, { message: "elige las variedades de pasta vegetal" }),
	weight: z.number().min(750, { message: "El item no puede pesar menos de 750 gr" }).max(6000, {
		message: "Si deseas comprar al por mayor, contáctate con nosotros!",
	}),
})

export type TProducto = z.infer<typeof productoSchema>
