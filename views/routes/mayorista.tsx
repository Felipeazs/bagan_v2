import { strapiContent } from "@/api"
import { BlocksRenderer } from "@strapi/blocks-react-renderer"
import { Await, createFileRoute, defer, getRouteApi } from "@tanstack/react-router"
import { Button } from "../components/ui/button"

export const Route = createFileRoute("/mayorista")({
	loader: async () => {
		const data = strapiContent({ page: "mayorista", query: "" })

		return { strapi_mayorista: defer(data) }
	},
	component: Mayorista,
})

const route = getRouteApi("/mayorista")

function Mayorista() {
	const { strapi_mayorista } = route.useLoaderData()

	return (
		<div className="min-h-dvh text-black">
			<Await
				promise={strapi_mayorista}
				fallback={<div>Loading...</div>}
				children={(strapi) => (
					<div className="w-[70%] m-auto my-10 border-2 border-bagan rounded-md p-10">
						<BlocksRenderer
							content={strapi.description}
							blocks={{
								paragraph: ({ children }) => <p>{children}</p>,
								list: ({ children }) => <p>{children}</p>,
							}}
							modifiers={{
								bold: ({ children }) => (
									<strong className="text-center text-bagan_dark">
										{children}
									</strong>
								),
							}}
						/>
						<Button variant={"outline"} className="border-2 border-bagan_dark mt-3">
							Descaga la ficha técnica
						</Button>
					</div>
				)}></Await>
		</div>
	)
}

export default Mayorista
