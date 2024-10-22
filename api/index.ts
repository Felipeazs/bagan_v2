import { type Comprador } from "@/models/comprador"
import { type Email } from "@/models/email"
import { type PrefRespons } from "@/models/types"
import { type ApiRoutes } from "@/server"
import { hc } from "hono/client"
import createClient from "openapi-fetch"
import type { paths } from "./strapi"

const URL = `${import.meta.env["VITE_STRAPI_URL"]}`
const STRAPI_API_KEY = import.meta.env["VITE_STRAPI_API_KEY"]!

const client = hc<ApiRoutes>("/", {
	headers: {
		"Content-Type": "application/json",
	},
})

export const { api } = client

const strapiClient = createClient<paths>({
	baseUrl: `${URL}/api`,
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${STRAPI_API_KEY}`,
	},
})

export const getStrapiHome = async () => {
	return await strapiClient
		.GET("/home", {
			params: {
				query: {
					//@ts-ignore
					fields: [
						"hero_title",
						"hero_subtitle",
						"section_about",
						"about_image",
						"circula_image",
						"mapa",
					],
					//@ts-ignore
					populate: [
						"hero_images",
						"caracteristicas",
						"productos.images",
						"packs.images",
						"contacto",
						"instituciones",
					],
				},
			},
		})
		.then((res) => {
			return res.data?.data
		})
		.catch(console.error)
}

const info_query = {
	params: {
		query: {
			fields: ["description"],
		},
	},
}

export const getStrapiMayorista = async () => {
	return await strapiClient
		.GET("/mayorista", {
			info_query,
		})
		.then((res) => {
			return res.data?.data
		})
		.catch(console.error)
}

interface IPaths {
	[key: string]: string
}

export const getStrapiInfo = async ({ info }: { info: string }) => {
	const informaciones: IPaths = {
		politicas_envio: "politicas_envio",
		terminos_condiciones: "terminos_condiciones",
		cambios_devoluciones: "cambios_devoluciones",
		privacidad_datos: "privacidad_datos",
	}

	return await strapiClient
		.GET("/informacion", {
			params: {
				query: {
					//@ts-ignore
					fields: [informaciones[info]],
				},
			},
		})
		.then((res) => {
			return res.data?.data
		})

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
