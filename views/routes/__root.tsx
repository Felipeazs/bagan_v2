import { Toaster } from "@/views/components/ui/sonner"
import { initMercadoPago } from "@mercadopago/sdk-react"
import { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet, ScrollRestoration } from "@tanstack/react-router"
import ReactGA from "react-ga4"
import { Helmet } from "react-helmet-async"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"

interface MyRouterContext {
	queryClient: QueryClient
}

const MP_PUBLIC_KEY = import.meta.env["VITE_MP_PUBLIC_KEY"]
const TRACKING_ID = "G-9837KWNK9L"
initMercadoPago(MP_PUBLIC_KEY, { locale: "es-CL" })

const Root = () => {
	if (import.meta.env.PROD) {
		ReactGA.initialize(TRACKING_ID)
		ReactGA.send({ hitType: "pageview", page: "/", title: "Home" })
	}

	return (
		<>
			<Helmet>
				<title>
					{import.meta.env.PROD
						? "Bienvenido a Bagán! by Up Foods"
						: `${import.meta.env.MODE} - Bagán!`}
				</title>
				<meta name="description" content="Venta y landing page de bagán" />
				<meta name="keywords" content="bagán, paté, bagazo, venta, vegan food, vegano" />
			</Helmet>
			<div className="font-primary text-white">
				<Navbar />
				<div>
					<ScrollRestoration />
					<Outlet />
				</div>
				<Toaster />
				<Footer />
			</div>
		</>
	)
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: Root,
})
