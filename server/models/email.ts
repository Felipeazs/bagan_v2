import { telefono_regex } from "./usuario"
import { z } from "zod"

export const emailSchema = z.object({
	nombre: z.string().trim().min(1, { message: "ingrese el nombre" }),
	email: z.string().trim().email({ message: "ingresa un correo válido" }),
	telefono: z.string().trim().regex(telefono_regex, { message: "ingrese el número de teléfono" }),
	mensaje: z.string({ message: "ingresa el mensaje" }),
})

export type TEmail = z.infer<typeof emailSchema>
