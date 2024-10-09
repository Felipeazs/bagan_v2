import { transporter } from '../api/nodemailer'
import { emailSchema } from '../db/schema/email'
import { getWebMessageTemplate } from '../utils/email-templates'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

export const emailRoute = new Hono().post('/', zValidator('json', emailSchema), async (c) => {
	const data = c.req.valid('json')

	try {
		transporter.sendMail({
			from: `No responder <${process.env.NM_MAILTRAP_FROM}>`,
			to: process.env.NM_MAILTRAP_RECEIVER,
			subject: 'no responder',
			html: getWebMessageTemplate(data),
		})

		c.status(200)
		return c.json({ status: 'ok' })
	} catch (err) {
		throw new Error('server error')
	}
})
