import env, { isProd } from "@/utils/env"
import { Mail, MailtrapClient } from "mailtrap"

export const mailtrapClient = new MailtrapClient({
	token: env.MT_API_KEY,
	accountId: Number(env.MT_ACCOUNT_ID),
	testInboxId: isProd ? undefined : Number(env.MT_TEST_ID),
})

const from_details = {
	name: "Bagán!",
	email: env.NM_MAILTRAP_FROM,
}

enum Subjects {
	VENTA = "Nueva compra",
	CONTACTO = "Nuevo mensaje",
	NEWSLETTER = "Nuevo usuario newsletter",
	GIFTCARD = "Nueva giftcard",
}

enum Categories {
	VENTA = "venta",
	CONTACTO = "contacto",
	NEWSLETTER = "newsletter",
	GIFTCARD = "giftcard",
}

const ventas_details = {
	from: from_details,
	to: [{ email: env.NM_MAILTRAP_RECEIVER_VENTAS }],
	subject: Subjects.VENTA,
	category: Categories.VENTA,
}

const contacto_details = {
	from: from_details,
	to: [{ email: env.NM_MAILTRAP_RECEIVER_CONTACTO }],
	subject: Subjects.CONTACTO,
	category: Categories.CONTACTO,
}

const newsletter_details = {
	from: from_details,
	to: [{ email: env.NM_MAILTRAP_RECEIVER_CONTACTO }],
	subject: Subjects.NEWSLETTER,
	category: Categories.NEWSLETTER,
}

const giftcard_details = {
	from: from_details,
	to: [{ email: env.NM_MAILTRAP_RECEIVER_VENTAS }],
	subject: Subjects.GIFTCARD,
	category: Categories.GIFTCARD,
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
		await mailtrapClient.send(mailtrap_info[type])
	} else {
		const test_inbox = await mailtrapClient.testing.inboxes.getList()

		if (test_inbox && test_inbox[0].sent_messages_count === 100) {
			console.log("test email inbox is full")
		} else if (test_inbox) {
			await mailtrapClient.testing.send(mailtrap_info[type])
		}
	}
}
