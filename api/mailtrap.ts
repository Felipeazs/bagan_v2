import { MailtrapClient } from "mailtrap"

const MAILTRAP_API_KEY = process.env["MT_API_KEY"]!
export const SENDER_EMAIL = process.env["NM_MAILTRAP_FROM"]!
export const RECEIVER = process.env["NM_MAILTRAP_RECEIVER"]!

const NODE_ENV = process.env["NODE_ENV"]!
const isProd = NODE_ENV === "production"

export const mailtrapClient = new MailtrapClient({
	token: MAILTRAP_API_KEY,
	accountId: isProd ? 2056185 : undefined,
	testInboxId: isProd ? undefined : 3142070,
})
