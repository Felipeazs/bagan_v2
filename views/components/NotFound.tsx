import { useNavigate } from "@tanstack/react-router"
import { Button } from "./ui/button"

const NotFound = () => {
	const navigate = useNavigate()

	return (
		<div className="flex flex-col gap-5 justify-center items-center h-screen text-black">
			<h1 className="text-4xl">Página no encontrada!</h1>
			<Button type="button" onClick={() => navigate({ to: "/" })}>
				Volver
			</Button>
		</div>
	)
}

export default NotFound
