import { createRouter } from "@/server/lib/create-app"
import * as handlers from "./mercadopago.handlers"
import * as routes from "./mercadopago.routes"

const router = createRouter().openapi(routes.feedback, handlers.feedback)

export default router
