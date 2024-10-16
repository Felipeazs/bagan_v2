import { MailtrapClient } from "mailtrap"

const NODE_ENV = process.env["NODE_ENV"]!
const isProd = NODE_ENV === "production"

export const mailtrapClient = new MailtrapClient({
	token: process.env["MT_API_KEY"]!,
	accountId: Number(process.env["MT_ACCOUNT_ID"])!,
	testInboxId: isProd ? undefined : Number(process.env["MT_TEST_ID"])!,
})
