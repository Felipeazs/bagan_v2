import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/informaciones/$informacion")({
	component: Informacion,
})

function Informacion() {
	const { informacion } = Route.useParams()

	return <p className="text-black">Informacion {informacion}</p>
}
