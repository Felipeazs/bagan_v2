import env from "@/utils/env"
import { MailtrapClient } from "mailtrap"

const isProd = env.NODE_ENV === "production"

export const mailtrapClient = new MailtrapClient({
	token: env.MT_API_KEY,
	accountId: Number(env.MT_ACCOUNT_ID),
	testInboxId: isProd ? undefined : Number(env.MT_TEST_ID),
})
