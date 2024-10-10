import { Hono } from "hono"

const STRAPI_URL = process.env.STRAPI_URL!
const STRAPI_API_KEY = process.env.STRAPI_API_KEY!

export const stripeRoute = new Hono().get("/:page", async (c) => {
	const page = c.req.param("page")
	const url = `${STRAPI_URL}/api/${page}`

	try {
		const res = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${STRAPI_API_KEY}`,
			},
		})

		const data = await res.json()

		c.status(200)
		return c.json(data)
	} catch (err) {
		console.log(err)
		throw new Error((err as Error).message)
	}
})
