import { verifyRut } from '../../utils/rut'
import { z } from 'zod'
import { Producto, productoSchema } from './productos'

export const telefono_regex = /^\d{9}$/

export const compradorSchema = z.object({
	nombre: z.string().min(1, { message: 'ingrese el nombre' }),
	apellido: z.string().min(1, { message: 'ingrese el apellido' }),
	rut: z.string().refine((rut) => verifyRut(rut) === true, { message: 'ingresa el rut' }),
	telefono: z.string().regex(telefono_regex, { message: 'ingrese el número de teléfono' }),
	email: z.string().email({ message: 'ingrese el email' }),
	direccion: z.object({
		calle: z.string().min(1, { message: 'ingrese la calle' }),
		numero: z.string().min(1, { message: 'ingrese el número' }),
		depto: z.string().optional(),
		comuna: z.string().min(1, { message: 'ingrese la comuna' }),
		region: z.string().min(1, { message: 'ingrese la región' }),
	}),
	items: z.array(productoSchema),
	envio: z.number().min(500),
})

export type Comprador = z.infer<typeof compradorSchema>

export type Actions = {
	guardarItems: (producto: Producto) => void
	quitarItems: (index: number) => void
	setEnvio: (precio: number) => void
}
