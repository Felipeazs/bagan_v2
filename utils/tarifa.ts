import { Producto } from "@/models/productos"
import { chile } from "./chile"

const tarifas = {
	xs: {
		origen: 3100,
		centro: 4300,
		extremo: 5200,
	},
	s: {
		origen: 4200,
		centro: 5600,
		extremo: 9500,
	},
	m: {
		origen: 4800,
		centro: 7300,
		extremo: 14500,
	},
	l: {
		origen: 5400,
		centro: 9200,
		extremo: 17000,
	},
}

export const calcularTarifa = (
	region: string,
	items: Producto[],
): { precio_envio: number; weight: number; error?: string } => {
	if (!items.length) {
		return {
			precio_envio: 0,
			weight: 0,
			error: "ingresa al menos 1 producto",
		}
	}

	let total_weight = 0
	items.forEach((i) => {
		total_weight += i.quantity * i.weight
	})

	let talla_pedido: keyof typeof tarifas = "xs"

	switch (true) {
		case total_weight > 0 && total_weight <= 500:
			talla_pedido = "xs"
			break
		case total_weight > 500 && total_weight <= 3000:
			talla_pedido = "s"
			break
		case total_weight > 3000 && total_weight <= 6000:
			talla_pedido = "m"
			break
		case total_weight > 6000 && total_weight <= 20000:
			talla_pedido = "l"
			break
	}

	if (total_weight > 6000) {
		return {
			precio_envio: 0,
			weight: total_weight,
			error: "Si quieres comprar al por mayor contáctate con nosotros!",
		}
	} else if (total_weight < 750) {
		return {
			precio_envio: 0,
			weight: 0,
			error: "ingresa al menos 1 producto",
		}
	}

	if (!region) return { precio_envio: 0, weight: total_weight }

	const envio: { [tipo_envio: string]: number } = tarifas[talla_pedido]
	const tipo_envio = chile.find((r) => r.name == region)!.value
	const precio_envio = envio[tipo_envio]

	return { precio_envio, weight: total_weight }
}
