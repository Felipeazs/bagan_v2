import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"

import "./views/index.css"
const queryClient = new QueryClient()

import { RouterProvider, createRouter } from "@tanstack/react-router"

// Import the generated route tree
import { routeTree } from "./views/routeTree.gen"

// Generate NotFound page
import NotFound from "./views/components/NotFound"

// Create a new router instance
const router = createRouter({
	routeTree,
	context: { queryClient },
	defaultStaleTime: Infinity,
	defaultNotFoundComponent: NotFound,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<HelmetProvider>
				<RouterProvider router={router} />
			</HelmetProvider>
		</QueryClientProvider>
	</StrictMode>,
)
