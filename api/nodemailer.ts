import nodemailer from 'nodemailer'

const isProd = process.env['NODE_ENV'] === 'production'

export const transporter = nodemailer.createTransport({
	host: process.env.NM_MAILTRAP_HOST,
	port: Number(process.env.NM_MAILTRAP_PORT),
	secure: isProd ? true : false,
	auth: {
		user: process.env.NM_MAILTRAP_USER,
		pass: process.env.NM_MAILTRAP_PASS,
	},
})
