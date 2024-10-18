import { Link, useLocation } from "@tanstack/react-router"
import Carrito from "./Carrito"

const Navbar = () => {
	const { pathname } = useLocation()

	const hover_style = "hover:underline underline-offset-2 decoration-2 decoration-bagan_dark"

	return (
		<div className="px-10 md:px-28 py-6 text-white flex bg-bagan justify-between items-center">
			<Link to="/">
				<img
					src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,q_auto,e_bgremoval:ffffff/v1/Bagan/naomdbo6nhkvhhv85tal"
					width={50}
					className="h-[70px] w-[150px] object-cover bg-transparent"
				/>
			</Link>
			<div className="flex gap-4 justify-center items-center">
				{pathname === "/mayorista" ? (
					<>
						<Link to="/" className={hover_style}>
							Inicio
						</Link>
					</>
				) : (
					<div className="flex gap-4">
						<a className={`hidden md:inline ${hover_style}`} href="/#nosotras">
							Nosotros
						</a>
						<a className={`hidden md:inline ${hover_style}`} href="/#productos">
							Productos
						</a>
						<a className={`hidden md:inline ${hover_style}`} href="/#contacto">
							Contacto
						</a>
						<Link to="/mayorista" className={hover_style}>
							Mayorista
						</Link>
					</div>
				)}
				<Carrito />
			</div>
		</div>
	)
}

export default Navbar
