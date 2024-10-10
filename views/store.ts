import { Actions, Comprador } from "@/db/schema/comprador"
import { create } from "zustand"

export const useCompradorStore = create<Comprador & Actions>((set) => ({
	nombre: "",
	apellido: "",
	rut: "",
	telefono: "",
	email: "",
	direccion: {
		calle: "",
		numero: "",
		comuna: "",
		region: "",
	},
	items: [],
	envio: 0,
	guardarItems: (producto) =>
		set((state) => ({
			items: [...state.items, producto],
			sub_total: state.items.reduce((a, b) => a + b.quantity * b.unit_price, 0),
		})),
	quitarItems: (index: number) =>
		set((state) => {
			state.items.splice(index, 1)

			return {
				items: [...state.items],
			}
		}),
	setEnvio: (precio: number) =>
		set(() => ({
			envio: precio,
		})),
}))
