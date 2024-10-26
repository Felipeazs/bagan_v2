import { Email } from "@/models/email"
import { PaymentInfo } from "@/models/types"

export const getWebMessageTemplate = (data: Email) => {
	return `
		<!DOCTYPE >
		<html lang="en-US">
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<style>
				@media (max-width: 430px) {
					h2 {
						text-align: center;
						font-size: 15px;
					}

					.bagan {
						width: 250px;
					}

					.mensaje-texto {
						font-size: 13px;
					}
				}
			</style>

			<body
				style="font-family: Verdana; display: flex; flex-direction: column; justify-items: center; align-items: center;">
				<a href="https://bagan.cl">
					<img
						class="bagan"
						style="width: 500px;"
						src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,q_auto,c_crop,g_auto,h_500,w_1100/v1/Bagan/naomdbo6nhkvhhv85tal" />
				</a>
				<div class="mensaje" style="padding: 5px;">
					<h2 style=" text-align: center;">${data.nombre}, te ha dejado un mensaje:</h2>
					<div
						class="caja"
						style="max-width: 600px; background: #F9B00E; padding: 25px 10px; border-radius: 5px;">
						<div
							class="mensaje-caja"
							style="border: 2px solid black; border-radius: 5px; display: flex; flex-direction: column; justify-items: center; align-items: center; background: white;">
							<p class="mensaje-texto" style="padding: 5px;">${data.mensaje}</p>
							<div
								class="contacto"
								style="font-size: 13px; padding: 5px; text-align: center; width: 100%; display: flex; flex-direction: column;">
								<strong>contacto</strong>
								<span>${data.email}</span>
								<span
									>+56 ${data.telefono.substring(0, 1)}
									${data.telefono.substring(1, 5)}
									${data.telefono.substring(5, 9)}</span
								>
							</div>
						</div>
					</div>
					<div class="footer" style="color: #c2c2c2; font-size: 13px; text-align: end;">
						<span>&#169; Up Foods</span> |
						<span>Pen&#771;a 459, Curico&#769;, Chile | 3341861</span>
					</div>
				</div>
			</body>
		</html>
	`
}
