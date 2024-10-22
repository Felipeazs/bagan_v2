import { getStrapiInfo } from "@/api"
import Fallback from "@/views/components/Fallback"
import { BlocksRenderer } from "@strapi/blocks-react-renderer"
import {
	Await,
	createFileRoute,
	defer,
	getRouteApi,
	ReactNode,
	useParams,
} from "@tanstack/react-router"

export const Route = createFileRoute("/informaciones/$informacion")({
	loader: async ({ params }) => {
		const data = getStrapiInfo({ info: params.informacion })

		return { strapi_info: defer(data) }
	},
	component: Informacion,
})

interface ITitle {
	[key: string]: string
}

function Informacion() {
	window.scrollTo(0, 0)

	const route = getRouteApi("/informaciones/$informacion")
	const data: { [key: string]: any } = route.useLoaderData()
	const { informacion } = useParams({ strict: false })

	const title: ITitle = {
		preguntas_frecuentes: "Preguntas Frecuentes",
		politicas_envio: "Políticas de Envío",
		terminos_condiciones: "Términos y Condiciones",
		cambios_devoluciones: "Políticas de Cambios y Devoluciones",
		privacidad_datos: "Privacidad de Datos",
	}

	if (!informacion) return {}

	return (
		<div className="min-h-dvh text-black">
			<Await
				promise={data.strapi_info}
				fallback={<Fallback />}
				children={(strapi: { [key: string]: any }) => (
					<div className="w-[90%] md:w-[70%] m-auto my-10 border-2 border-bagan rounded-md p-5 md:p-10">
						<p className="text-2xl font-bold pb-5">{title[informacion!]}</p>
						<BlocksRenderer
							content={strapi?.[informacion] as ReactNode[]}
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
					</div>
				)}></Await>
		</div>
	)
}
