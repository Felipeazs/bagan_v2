import { beforeAll, describe, expect, it } from "vitest"

import env from "@/utils/env"
import { PreferenceRequest } from "mercadopago/dist/clients/preference/commonTypes"
import { EID, ETitle } from "../models/producto"
import { TUsuario } from "../models/usuario"
import { setPreferenceDetails } from "../utils/preference"
import { createPreference } from "./mercadopago"

if (env.NODE_ENV !== "test") {
	throw new Error("NODE_ENV must be 'test'")
}

describe("mercadopago", () => {
	let preference_body: PreferenceRequest
	beforeAll(() => {
		const user_data: TUsuario = {
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

		preference_body = setPreferenceDetails(user_data)
	})

	it("Should create a preference ID", async () => {
		const res = await createPreference(preference_body)

		expect(res?.api_response.status).toBe(201)
	})
})
