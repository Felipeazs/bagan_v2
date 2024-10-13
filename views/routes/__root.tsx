import { Toaster } from "@/views/components/ui/sonner"
import { initMercadoPago } from "@mercadopago/sdk-react"
import { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { useEffect } from "react"
import ReactGA from "react-ga4"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"

interface MyRouterContext {
	queryClient: QueryClient
}

const MP_PUBLIC_KEY = import.meta.env["VITE_MP_PUBLIC_KEY"]
const TRACKING_ID = "G-9837KWNK9L"

const Root = () => {
	useEffect(() => {
		initMercadoPago(MP_PUBLIC_KEY, { locale: "es-CL" })

		if (import.meta.env.PROD) {
			ReactGA.initialize(TRACKING_ID)
			ReactGA.send({ hitType: "pageview", page: "/", title: "Bagán by Up Foods" })
		}
	}, [])

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
