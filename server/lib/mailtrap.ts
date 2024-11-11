import env from "@/utils/env"
import { Mail, MailtrapClient } from "mailtrap"

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

export enum TEmailType {
	venta = "venta",
	contacto = "contacto",
	giftcard = "giftcard",
	newsletter = "newsletter",
}

export const sendEmail = async ({ type, html }: { type: TEmailType; html: string }) => {
	const mailtrap_info: { [key: string]: Mail } = {
		ventas: { ...ventas_details, html },
		contacto: { ...contacto_details, html },
		newsletter: { ...newsletter_details, html },
		giftcard: { ...giftcard_details, html },
	}

	if (isProd) {
		mailtrapClient.send(mailtrap_info[type])
	} else {
		const test_inbox = await mailtrapClient.testing.inboxes.getList()

		if (test_inbox && test_inbox[0].sent_messages_count === 100) {
			console.log("test email inbox is full")
		} else if (test_inbox) {
			mailtrapClient.testing.send(mailtrap_info[type])
		}
	}
}
