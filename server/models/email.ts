import { telefono_regex } from "./usuario"
import { z } from "zod"

export const contactoSchema = z.object({
	nombre: z.string().trim().min(1, { message: "ingrese el nombre" }),
	email: z.string().trim().email({ message: "ingresa un correo válido" }),
	apellido: z.string().trim().min(1, { message: "ingrese el apellido" }),
	telefono: z.string().trim().regex(telefono_regex, { message: "ingrese el número de teléfono" }),
	mensaje: z.string({ message: "ingresa el mensaje" }),
})

export const newsletterSchema = contactoSchema.omit({
	telefono: true,
	mensaje: true,
})

export type TNewsletter = z.infer<typeof newsletterSchema>
export type TContacto = z.infer<typeof contactoSchema>
