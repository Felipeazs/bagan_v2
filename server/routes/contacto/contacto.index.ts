import { createRouter } from "@/server/lib/create-app"
import * as routes from "./contacto.routes"
import * as handlers from "./contacto.handlers"

const router = createRouter()
	.openapi(routes.contacto, handlers.contacto)
	.openapi(routes.newsletter, handlers.newsletter)

export default router
