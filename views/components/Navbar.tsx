import { Link } from "@tanstack/react-router"
import Carrito from "./Carrito"

const Navbar = () => {
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
				<a
					href="#nosotras"
					className="hidden md:inline [&.active]:font-bold hover:text-gray-900">
					Nosotras
				</a>
				<a
					href="#productos"
					className="hidden md:inline [&.active]:font-bold hover:text-gray-900">
					Productos
				</a>
				<a
					href="#contacto"
					className="hidden md:inline [&.active]:font-bold hover:text-gray-900">
					Contacto
				</a>
				<Carrito />
			</div>
		</div>
	)
}

export default Navbar
