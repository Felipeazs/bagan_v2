import { beforeAll, describe, expect, it } from "vitest"

import env from "@/utils/env"
import { TContacto } from "../models/email"
import { PaymentInfo } from "../types"
import { sendWebhook } from "./discord"

if (env.NODE_ENV !== "test") {
	throw new Error("NODE_ENV must be 'test'")
}

describe("discord", () => {
	let contacto_data: TContacto
	let payment_data: PaymentInfo

	beforeAll(() => {
		contacto_data = {
			nombre: "Test",
			apellido: "Test",
			email: "test@test.cl",
			telefono: "789456123",
			mensaje: "Hola test",
		}

		payment_data = {
			id: 0,
			date_approved: "test",
			status: "test",
			payment_method_id: "test",
			transaction_amount: 0,
			shipping_amount: 0,
			total_paid_amount: 0,
			external_reference: "test",
			additional_info: {
				items: [],
			},
			payer: {
				name: "test",
				email: "test",
				phone: {
					number: "test",
				},
				identification: {
					id: "test",
					type: "test",
					number: "test",
				},
			},
			shipments: {
				street_name: "test",
				city_name: "test",
				street_number: "test",
				state_name: "test",
				apartment: "test",
			},
		}
	})

	it("Should send a webhook contacto message", async () => {
		const res = await sendWebhook(contacto_data)

		expect(res).toHaveProperty("id")
	})

	it("Should send a webhook payment message", async () => {
		const res = await sendWebhook(payment_data)

		expect(res).toHaveProperty("id")
	})
})
