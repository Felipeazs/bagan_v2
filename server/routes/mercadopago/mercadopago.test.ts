import { beforeAll, describe, expect, it } from "vitest"

import { EID, ETitle } from "@/server/models/producto"
import { TUsuario } from "@/server/models/usuario"
import env from "@/utils/env"
import { client } from "../contacto/contacto.test"

if (env.NODE_ENV !== "test") {
	throw new Error("NODE_ENV must be 'test'")
}

describe("mercadopago", () => {
	let user_data: TUsuario
	let failed_user_data: TUsuario

	beforeAll(() => {
		user_data = {
			nombre: "Felipe",
			apellido: "Zapata",
			rut: "16741352-8",
			telefono: "123456789",
			email: "test@test.cl",
			direccion: {
				calle: "Marte",
				numero: "2183",
				depto: undefined,
				region: "Valparaíso",
				comuna: "Quilpué",
			},
			items: [
				{
					id: EID.tripack,
					description: "testing",
					title: ETitle.tripack,
					quantity: 1,
					unit_price: 12000,
					details: ["pimentón rojo", "pesto albahaca", "tomate orégano"],
					weight: 750,
				},
			],
			envio: 5000,
		}

		failed_user_data = {
			nombre: "Felipe",
			apellido: "Zapata",
			rut: "16741352-8",
			telefono: "123456789",
			email: "test@test.cl",
			direccion: {
				calle: "Marte",
				numero: "2183",
				depto: undefined,
				region: "Valparaíso",
				comuna: "Quilpué",
			},
			items: [
				{
					id: EID.tripack,
					description: "testing",
					title: ETitle.tripack,
					quantity: 1,
					unit_price: 12000,
					details: ["pesto albahaca", "tomate orégano"],
					weight: 750,
				},
			],
			envio: 5000,
		}
	})

	it("Should create a preference ID", async () => {
		const res = await client.mercadopago["create-preference"].$post({ json: user_data })

		expect(res.status).toBe(201)
	})

	it("Should fail creating a preference ID", async () => {
		const res = await client.mercadopago["create-preference"].$post({ json: failed_user_data })

		expect(res.status).toBe(422)
	})
})
