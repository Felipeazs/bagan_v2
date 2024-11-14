import { beforeAll, describe, expect, it } from "vitest"

import env from "@/utils/env"
import { IEmailContent, TEmailType } from "../types"
import { sendEmail } from "./mailtrap"

if (env.NODE_ENV !== "test") {
	throw new Error("NODE_ENV must be 'test'")
}

describe("mailtrap", () => {
	let email_content: IEmailContent
	beforeAll(() => {
		email_content = {
			type: TEmailType.contacto,
			html: "<p>testing emails</p>",
		}
	})

	it("Should send and email", async () => {
		const res = await sendEmail(email_content)

		expect(res?.success).toBe(true)
		expect(res).toEqual({
			success: true,
			message_ids: expect.arrayContaining([]),
		})
	})
})
