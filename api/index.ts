import { hc } from 'hono/client'
import { Email } from '../db/schema/email'
import { ApiRoutes } from '../server'
import { Comprador } from '@/db/schema/comprador'
import { PrefRespons } from '../db/schema/types'

const client = hc<ApiRoutes>('/', {
	headers: {
		'Content-Type': 'application/json',
	},
})

const STRIPE_URL = import.meta.env.VITE_URL
const AUTHORIZATION = `Bearer ${import.meta.env.VITE_STRAPI_API_KEY!}`

export const homeContent = async (page: string) => {
	const url = `${STRIPE_URL}/api/${page}`
	return await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: AUTHORIZATION,
		},
	})
		.then((res) => res.json())
		.then((res) => {
			const { hero_title, hero_subtitle, section_about, section_circula } = res.data
			return { hero_title, hero_subtitle, section_about, section_circula }
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
	return await api['mercado-pago']
		.$post({ json: value })
		.then((res) => res.json())
		.then((data) => data as PrefRespons)
		.catch(console.error)
}

export const api = client.api
