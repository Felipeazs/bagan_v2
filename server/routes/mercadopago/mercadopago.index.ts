import { createRouter } from "@/server/lib/create-app"
import * as routes from "./mercadopago.routes"
import * as handlers from "./mercadopago.handlers"

const router = createRouter().openapi(routes.preferenceId, handlers.preferenceId)

export default router
