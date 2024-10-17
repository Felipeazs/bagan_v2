import { Link, useLocation } from "@tanstack/react-router"
import Carrito from "./Carrito"

const Navbar = () => {
	const { pathname } = useLocation()

	return (
		<div className="px-10 md:px-28 py-6 text-white flex bg-bagan justify-between align-center items-center">
			<div className="">
				<Link to="/">
					<img
						src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,q_auto,e_bgremoval:ffffff/v1/Bagan/naomdbo6nhkvhhv85tal"
						width={50}
						className="h-[70px] w-[150px] object-cover bg-transparent"
					/>
				</Link>
			</div>
			<div className="flex gap-4 justify-center items-center">
				{pathname === "/mayorista" ? (
					<>
						<Link
							to="/"
							className="hidden md:inline min-w-[83px] max-w-[79px] hover:text-gray-900 hover:font-bold">
							Inicio
						</Link>
						<Link
							to="/mayorista"
							className="hidden md:inline min-w-[83px] max-w-[79px] hover:text-gray-900 hover:font-bold">
							Mayoristas
						</Link>
					</>
				) : (
					<>
						<a href="/#nosotras">Nosotros</a>
						<a href="/#productos">Productos</a>
						<a href="/#contacto">Contacto</a>
						<Link
							to="/mayorista"
							className="hidden md:inline min-w-[83px] max-w-[79px] hover:text-gray-900 hover:font-bold">
							Mayoristas
						</Link>
					</>
				)}
				<Carrito />
			</div>
		</div>
	)
}

export default Navbar
