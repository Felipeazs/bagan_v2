import { MailtrapClient } from "mailtrap"

const MAILTRAP_API_KEY = process.env["MT_API_KEY"]!

const NODE_ENV = process.env["NODE_ENV"]!
const isProd = NODE_ENV === "production"
const ACCOUNT_ID = Number(process.env["MT_ACCOUNT_ID"])!

export const mailtrapClient = new MailtrapClient({
	token: MAILTRAP_API_KEY,
	accountId: ACCOUNT_ID,
	testInboxId: isProd ? undefined : ACCOUNT_ID,
})
