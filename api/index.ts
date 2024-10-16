import { type Comprador } from "@/models/comprador"
import { type Email } from "@/models/email"
import { type PrefRespons } from "@/models/types"
import { type ApiRoutes } from "@/server"
import { hc } from "hono/client"

const client = hc<ApiRoutes>("/", {
	headers: {
		"Content-Type": "application/json",
	},
})

export const { api } = client

const URL = `${import.meta.env["VITE_STRAPI_URL"]}`
const STRAPI_API_KEY = import.meta.env["VITE_STRAPI_API_KEY"]

export const strapiContent = async ({ page, query }: { page: string; query?: string }) => {
	const url = `${URL}/api/${page}${query}`

	return await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${STRAPI_API_KEY}`,
		},
	})
		.then((res) => res.json())
		.then((res) => res.data)
		.catch(console.error)
}

export const sendEmailContacto = async ({ value }: { value: Email }) => {
	return await api.contacto
		.$post({ json: value })
		.then((res) => res.json())
		.then((data) => data)
		.catch(console.error)
}

export async function createMPPreferences({ value }: { value: Comprador }) {
	return await api["mercado-pago"]["create-preference"]
		.$post({ json: value })
		.then((res) => res.json())
		.then((data) => data as PrefRespons)
		.catch(console.error)
}
