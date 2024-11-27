import { type ApiRoutes } from "@/app"
import { TContacto, type TNewsletter } from "@/server/models/email"
import { TPago } from "@/server/models/pago"
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

export async function createPago({ value }: { value: TPago }) {
	return await client.pago
		.$post({ json: value })
		.then((res) => res.json())
		.then((data) => data)
		.catch(console.error)
}
