import { MailtrapClient } from "mailtrap"

const MAILTRAP_API_KEY = process.env["MT_API_KEY"]!
export const SENDER_EMAIL = process.env["NM_MAILTRAP_FROM"]!
export const RECEIVER = process.env["NM_MAILTRAP_RECEIVER"]!

const NODE_ENV = process.env["NODE_ENV"]!
const isProd = NODE_ENV === "production"
const ACCOUNT_ID = Number(process.env["MT_ACCOUNT_ID"])!

export const mailtrapClient = new MailtrapClient({
	token: MAILTRAP_API_KEY,
	accountId: isProd ? ACCOUNT_ID : undefined,
	testInboxId: isProd ? undefined : ACCOUNT_ID,
})
