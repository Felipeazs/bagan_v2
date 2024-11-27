import { createRouter } from "@/server/lib/create-app"
import * as routes from "./pago.routes"
import * as handlers from "./pago.handlers"
import * as fhandlers from "./feedback.handlers"

const router = createRouter()
	.openapi(routes.pago, handlers.pago)
	.openapi(routes.feedback, fhandlers.feedback)

export default router
