import { Link } from "@tanstack/react-router"

const Footer = () => {
	const hover_style = "hover:text-bagan_dark"

	return (
		<div className="flex flex-col md:flex-row justify-around md:items-center gap-5 p-5 bg-bagan text-white">
			<div className="flex flex-col">
				<p className="uppercase font-bold py-2">Información y políticas</p>
				<Link
					to="/informaciones/$informacion"
					params={{ informacion: "preguntas_frecuentes" }}
					disabled={true}
					className={hover_style}>
					Preguntas Frecuentes
				</Link>
				<Link
					to="/informaciones/$informacion"
					params={{ informacion: "politicas_envio" }}
					className={hover_style}>
					Políticas de Envío
				</Link>
				<Link
					to="/informaciones/$informacion"
					params={{ informacion: "terminos_condiciones" }}
					className={hover_style}>
					Términos y Condiciones
				</Link>
				<Link
					to="/informaciones/$informacion"
					params={{ informacion: "cambios_devolucion" }}
					className={hover_style}>
					Cambios y Devoluciones
				</Link>
			</div>
			<p className="text-center font-bold">Bagan.cl 2024 | Todos los derechos reservados</p>
		</div>
	)
}

export default Footer
