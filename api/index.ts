import { type ApiRoutes } from "@/app"
import { type TEmail } from "@/server/models/email"
import { TUsuario } from "@/server/models/usuario"
import { hc } from "hono/client"

const client = hc<ApiRoutes>("/api", {
	headers: {
		"Content-Type": "application/json",
	},
})

export const sendEmailContacto = async ({ value }: { value: TEmail }) => {
	return await client.contacto
		.$post({ json: value })
		.then((res) => res.json())
		.then((data) => data)
		.catch(console.error)
}

export async function createMPPreferences({ value }: { value: TUsuario }) {
	return await client.mercadopago["create-preference"]
		.$post({ json: value })
		.then((res) => {
			if (res.status === 400) return
			return res.json()
		})
		.then((data) => data)
		.catch(console.error)
}
