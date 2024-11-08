import { type ApiRoutes } from "@/app"
import { TContacto, type TNewsletter } from "@/server/models/email"
import { TUsuario } from "@/server/models/usuario"
import { hc } from "hono/client"

const client = hc<ApiRoutes>("/api", {
	headers: {
		"Content-Type": "application/json",
	},
})

export const sendEmailContacto = async ({ value }: { value: TContacto }) => {
	return await client.contacto.message
		.$post({ json: value })
		.then((res) => res.json())
		.then((data) => data)
		.catch(console.error)
}

export async function addToNewsletter({ value }: { value: TNewsletter }) {
	return await client.contacto.newsletter
		.$post({ json: value })
		.then((res) => res.json())
		.then((data) => data)
		.catch(console.error)
}

export async function createMPPreferences({ value }: { value: TUsuario }) {
	return await client.mercadopago["create-preference"]
		.$post({ json: value })
		.then((res) => res.json())
		.then((data) => data)
		.catch(console.error)
}
