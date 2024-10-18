import { Link } from "@tanstack/react-router"

const Footer = () => {
	const hover_style = "hover:text-bagan_dark"

	return (
		<div className="flex flex-row justify-around items-center p-5 bg-bagan text-white">
			<div className="flex flex-col">
				<p className="uppercase font-bold py-2">Información y políticas</p>
				<Link className={hover_style}>Preguntas Frecuentes</Link>
				<Link className={hover_style}>Políticas de Envío</Link>
				<Link className={hover_style}>Términos y Condiciones</Link>
				<Link className={hover_style}>Cambios y Devoluciones</Link>
			</div>
			<p className="text-center font-bold">Bagan.cl 2024 | Todos los derechos reservados</p>
		</div>
	)
}

export default Footer
