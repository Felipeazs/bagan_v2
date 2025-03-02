import { Link, useLocation } from "@tanstack/react-router"
import { useState } from "react"
import Carrito from "./Carrito"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "./ui/sheet"
import CarritoLogo2 from "../assets/carrito2.svg"
import CarritoLogo from "../assets/carrito.svg"

const Navbar = () => {
	const [isDrawer, setIsDrawer] = useState<boolean>(false)
	const { pathname } = useLocation()

	const hover_style = "hover:underline underline-offset-2 decoration-2 decoration-bagan_dark"

	return (
		<div className="px-10 md:px-28 py-6 text-white flex bg-bagan justify-between items-center">
			<Link to="/">
				<img
					src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,q_auto,e_bgremoval:ffffff/v1/Bagan/naomdbo6nhkvhhv85tal"
					width={50}
					className="h-[70px] w-[150px] object-cover bg-transparent transition-all ease-in-out duration-300 hover:scale-110"
				/>
			</Link>
			<div className="sm:hidden">
				<Sheet
					open={isDrawer}
					onOpenChange={setIsDrawer}>
					<SheetTrigger>Menu</SheetTrigger>
					<SheetContent side="left">
						<SheetTitle className="pb-5">Menu</SheetTitle>
						<SheetDescription></SheetDescription>
						<div className="flex flex-col gap-2">
							<Link
								to="/"
								onClick={() => setIsDrawer(false)}
								className={hover_style}>
								Inicio
							</Link>
							<Link
								to="/mayorista"
								onClick={() => setIsDrawer(false)}
								className={hover_style}>
								Mayorista
							</Link>
							<Carrito img={CarritoLogo2} />
						</div>
					</SheetContent>
				</Sheet>
			</div>
			<div className="hidden sm:flex gap-4 justify-center items-center">
				{pathname === "/mayorista" || pathname.startsWith("/informaciones") ? (
					<Link
						to="/"
						className={hover_style}>
						Inicio
					</Link>
				) : (
					<div className="flex gap-4">
						<a
							className={`hidden lg:inline ${hover_style}`}
							href="/#nosotras">
							Nosotros
						</a>
						<a
							className={`hidden lg:inline ${hover_style}`}
							href="/#productos">
							Productos
						</a>
						<a
							className={`hidden lg:inline ${hover_style}`}
							href="/#contacto">
							Contacto
						</a>
						<a
							className={`hidden lg:inline ${hover_style}`}
							href="/#newsletter">
							Newsletter
						</a>
						<Link
							to="/mayorista"
							className={hover_style}>
							Mayorista
						</Link>
					</div>
				)}
				<Carrito img={CarritoLogo} />
			</div>
		</div>
	)
}

export default Navbar
