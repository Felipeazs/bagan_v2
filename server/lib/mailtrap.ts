import { HTTPException } from "hono/http-exception"
import { Mail, MailtrapClient, SendResponse } from "mailtrap"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

import env, { isProd } from "@/utils/env"
import { IEmailContent } from "../types"

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

export const sendEmail = async (content: IEmailContent): Promise<SendResponse | undefined> => {
	const { type, html } = content

	const mailtrap_info: { [key: string]: Mail } = {
		ventas: { ...ventas_details, html },
		contacto: { ...contacto_details, html },
		newsletter: { ...newsletter_details, html },
		giftcard: { ...giftcard_details, html },
	}

	try {
		let response
		if (isProd) {
			response = await mailtrapClient.send(mailtrap_info[type])
		} else {
			const test_inbox = await mailtrapClient.testing.inboxes.getList()

			if (test_inbox && test_inbox[0].sent_messages_count === 100) {
				console.error("test email inbox is full")
				return {
					success: true,
					message_ids: ["test email inbox is full"],
				}
			} else if (test_inbox) {
				response = await mailtrapClient.testing.send(mailtrap_info[type])
			}
		}

		if (!response?.success) {
			console.error({
				success: response?.success,
				message: response?.message_ids,
			})
			return
		}

		return response
	} catch (err) {
		throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
			message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
			cause: err,
		})
	}
}
