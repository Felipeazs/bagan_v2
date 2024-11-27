import { TPago } from "../models/pago"
import { store } from "./payment"

export const setPreferenceDetails = (data: TPago): TPago => {
	data.items.forEach((p) => {
		const producto = store.find((s) => s.id === p.id)

		if (!producto) return

		p.unit_price = producto.unit_price
		p.category_id = "alimentos"

		if (p.title === "Giftcard") {
			p.description = producto.title
			return
		}

		let tomate = 0
		let pimenton = 0
		let pesto = 0

		p.details.forEach((d) => {
			if (d === "tomate orégano") tomate++
			else if (d === "pimentón rojo") pimenton++
			else pesto++
		})

		p.description = [
			`Tomate orégano (${tomate})`,
			`Pimentón rojo (${pimenton})`,
			`Pesto albahaca (${pesto})`,
		].join(", ")
	})

	return data
}
