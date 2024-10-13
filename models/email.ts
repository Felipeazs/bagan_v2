import { z } from "zod"
import { telefono_regex } from "./comprador"

export const emailSchema = z.object({
	nombre: z.string().trim().min(1, { message: "ingrese el nombre" }),
	email: z.string().trim().email({ message: "ingresa un correo válido" }),
	telefono: z.string().trim().regex(telefono_regex, { message: "ingrese el número de teléfono" }),
	mensaje: z.string({ message: "ingresa el mensaje" }),
})

export type Email = z.infer<typeof emailSchema>
