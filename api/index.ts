import { hc } from "hono/client"
import { Email } from "../db/schema/email"
import { ApiRoutes } from "../server"
import { Comprador } from "@/db/schema/comprador"
import { PrefRespons } from "../db/schema/types"

const client = hc<ApiRoutes>("/", {
	headers: {
		"Content-Type": "application/json",
	},
})

const url = `${import.meta.env.VITE_STRAPI_URL}/api`

export const strapiContent = async (page: string) => {
	return await fetch(
		`${url}/${page}?populate=hero_images&populate=productos.images&populate=packs.images`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/josn",
				Authorization: `Bearer ${import.meta.env.VITE_STRAPI_API_KEY}`,
			},
		},
	)
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
	return await api["mercado-pago"]
		.$post({ json: value })
		.then((res) => res.json())
		.then((data) => data as PrefRespons)
		.catch(console.error)
}

export const api = client.api
