import { getStrapiMayorista } from "@/api"
import { BlocksRenderer } from "@strapi/blocks-react-renderer"
import { Await, createFileRoute, defer, getRouteApi, ReactNode } from "@tanstack/react-router"
import Fallback from "../components/Fallback"
import { Button } from "../components/ui/button"

export const Route = createFileRoute("/mayorista")({
	loader: async () => {
		const data = getStrapiMayorista()

		return { strapi_mayorista: defer(data) }
	},
	component: Mayorista,
})

function Mayorista() {
	const route = getRouteApi("/mayorista")
	const { strapi_mayorista } = route.useLoaderData()

	return (
		<div className="min-h-dvh text-black">
			<Await
				promise={strapi_mayorista}
				fallback={<Fallback />}
				children={(strapi) => (
					<div className="w-[90%] md:w-[70%] m-auto my-10 border-2 border-bagan rounded-md p-5 md:p-10">
						<BlocksRenderer
							content={strapi?.description as ReactNode[]}
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
						<Button className="bg-bagan_dark mt-3 font-bold">
							Descaga la ficha técnica
						</Button>
					</div>
				)}></Await>
		</div>
	)
}

export default Mayorista
