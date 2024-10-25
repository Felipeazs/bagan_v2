import { AppRouteHandler } from "@/server/lib/types"
import { PreferenceRoute } from "./mercadopago.routes"

export const preferenceId: AppRouteHandler<PreferenceRoute> = async (c) => {
	return c.json(1, 200)
}
