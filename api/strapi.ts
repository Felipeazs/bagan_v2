import createClient from "openapi-fetch"
import { paths } from "./types/strapi"

const strapiClient = createClient<paths>({
	baseUrl: `${import.meta.env.VITE_STRAPI_URL}/api`,
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${import.meta.env.VITE_STRAPI_API_KEY}`,
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

export const getStrapiMayorista = async () => {
	return await strapiClient
		.GET("/mayorista", {
			params: {
				query: {
					//@ts-ignore
					fields: ["description"],
				},
			},
		})
		.then((res) => {
			return res.data?.data
		})
		.catch(console.error)
}

export const getStrapiInfo = async ({ info }: { info: string }) => {
	const informaciones: { [key: string]: string } = {
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
