import { testClient } from "hono/testing"
import { describe, expect, it } from "vitest"

import { app } from "@/app"
import env from "@/utils/env"
import router from "./contacto.index"

if (env.NODE_ENV !== "test") {
	throw new Error("NODE_ENV must be 'test'")
}

describe("contacto", () => {
	const client = testClient(app.route("/", router))

	const user_data = {
		nombre: "Felipe",
		apellido: "Zapata",
		telefono: "123456789",
		email: "test@test.cl",
		mensaje: "test",
	}

	it("Should send a contact email/discord message", async () => {
		const res = await client.contacto.message.$post({ json: user_data })
		const json = await res.json()

		expect(res.status).toBe(200)
		expect(json).toHaveProperty("status")
		expect(json.status).toBe(true)
	})

	it("Should send an email message to add a new member to the newsletter", async () => {
		const res = await client.contacto.newsletter.$post({ json: user_data })
		const json = await res.json()

		expect(res.status).toBe(200)
		expect(json).toHaveProperty("status")
		expect(json.status).toBe(true)
	})

	const failed_user_data = {
		nombre: "",
		apellido: "Zapata",
		telefono: "123456789",
		email: "test@test.cl",
		mensaje: "test",
	}

	it("Should not send a contact email/discord message", async () => {
		const res = await client.contacto.message.$post({ json: failed_user_data })
		expect(res.status).toBe(422)
	})

	it("Should send an email message to add a new member to the newsletter", async () => {
		const res = await client.contacto.newsletter.$post({ json: failed_user_data })

		expect(res.status).toBe(422)
	})
})
