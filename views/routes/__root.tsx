import { Toaster } from "@/views/components/ui/sonner"
import { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import { initMercadoPago } from "@mercadopago/sdk-react"

interface MyRouterContext {
	queryClient: QueryClient
}

const MP_PUBLIC_KEY = import.meta.env["VITE_MP_PUBLIC_KEY"]

const Root = () => {
	initMercadoPago(MP_PUBLIC_KEY, { locale: "es-CL" })

	return (
		<div className="font-primary text-white">
			<Navbar />
			<div>
				<Outlet />
			</div>
			<Toaster />
			<Footer />
		</div>
	)
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: Root,
})
