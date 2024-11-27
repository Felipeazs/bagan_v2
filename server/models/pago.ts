import { z } from "zod"

import { verifyRut } from "../utils/rut"
import { productoSchema, TProducto } from "./producto"

export const telefono_regex = /^\d{9}$/

export const pagoSchema = z.object({
	nombre: z.string().trim().min(1, { message: "ingrese el nombre" }),
	apellido: z.string().trim().min(1, { message: "ingrese el apellido" }),
	rut: z
		.string()
		.trim()
		.refine((rut) => verifyRut(rut) === true, { message: "ingresa el rut" }),
	telefono: z.string().trim().regex(telefono_regex, { message: "ingrese el número de teléfono" }),
	email: z.string().trim().email({ message: "ingrese el email" }),
	direccion: z.object({
		calle: z.string().trim().min(1, { message: "ingrese la calle" }),
		numero: z.string().trim().min(1, { message: "ingrese el número" }),
		depto: z.string().trim().optional(),
		comuna: z.string().trim().min(1, { message: "ingrese la comuna" }),
		region: z.string().trim().min(1, { message: "ingrese la región" }),
	}),
	items: z.array(productoSchema),
	envio: z.number().min(500),
	mediospago: z.enum(["mercadopago", "ventipay", "fintoc"]).default("mercadopago"),
	codigo: z
		.object({
			serie: z.string(),
			valor: z.number(),
			pack: z.enum(["tripack", "sixpack"]),
		})
		.optional(),
})

export type TPago = z.infer<typeof pagoSchema>
