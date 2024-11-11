import env from "@/utils/env"
import { MailtrapClient } from "mailtrap"

const isProd = env.NODE_ENV === "production"

export const mailtrapClient = new MailtrapClient({
	token: env.MT_API_KEY,
	accountId: Number(env.MT_ACCOUNT_ID),
	testInboxId: isProd ? undefined : Number(env.MT_TEST_ID),
})

const from_details = {
	name: "Bagán!",
	email: env.NM_MAILTRAP_FROM,
}

export const ventas_details = {
	from: from_details,
	to: [{ email: env.NM_MAILTRAP_RECEIVER_VENTAS }],
	subject: "Nueva compra",
	category: "venta",
}

export const contacto_details = {
	from: from_details,
	to: [{ email: env.NM_MAILTRAP_RECEIVER_CONTACTO }],
	subject: "Nuevo mensaje",
	category: "contacto",
}

export const newsletter_details = {
	from: from_details,
	to: [{ email: env.NM_MAILTRAP_RECEIVER_CONTACTO }],
	subject: "Newsletter",
	category: "newsletter",
}

export const giftcard_details = {
	from: from_details,
	to: [{ email: env.NM_MAILTRAP_RECEIVER_VENTAS }],
	subject: "Giftcard",
	category: "giftcard",
}
