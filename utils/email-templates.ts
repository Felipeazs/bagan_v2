import { Email } from "../db/schema/email"
import { PaymentInfo } from "../db/schema/types"

export const getResumenCompraTemplate = (details: PaymentInfo) => {
	let table: string[] = []
	details.additional_info.items?.forEach((i) => {
		table = [
			...table,
			`
        <tr style="border-bottom: 1px solid #ddd text-align: center; vertical-align: 0q;">
            <td>${i.title}</td>
            <td class="descripcion" style="display:flex; flex-direction:column; justify-items: center; align-items: center; width: 190px;">
                ${i
					.description!.split(", ")
					.map((d) => `<div>${d}</div>`)
					.join("")}
            </td>
            <td style="text-align: center">${i.quantity}</td>
        </tr>
        `,
		]
	})

	return `
<!DOCTYPE>
<html lang="en-US">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
    @media (max-width: 430px) {
        .contacto,
        .resumen {
            font-size: 11px;
        }

        h2 {
            text-align: center;
            font-size: 15px;
        }

        table {
            font-size: 11px;
            max-width: 90%;
        }

        .bagan {
            width: 250px;
        }

        .mensaje-texto {
            font-size: 13px;
        }

        .descripcion {
            width: 130px;
            font-size: 11px;
        }

    }
</style>

<body style="font-family: Verdana; display: flex; flex-direction: column; justify-items: center; align-items: center;">
    <a href="https://bagan.cl">
        <img class="bagan" style="width: 500px;"
            src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,q_auto,c_crop,g_auto,h_500,w_1100/v1/Bagan/naomdbo6nhkvhhv85tal" />
    </a>
    <div class="mensaje" style="text-align: center; padding: 5px;">
        <h2 style="text-align: center;">Nueva compra registrada!</h2>
        <h3>${details.id}</h3>
        <div class="caja" style="max-width: 600px; background: #F9B00E; padding: 25px 10px; border-radius: 5px;">
            <div class="mensaje-caja" style="border: 2px solid black; border-radius: 5px; display: flex; flex-direction: column; justify-items: center; align-items: center; background: white;">
                <strong>Resumen</strong>
                <div class="resumen" style="display: flex; flex-direction: column; justify-items: center; align-items: center; font-size: 13px; padding: 20px 10px; text-align: center; width: 100%;">
                    <table style="font-size: 13px; max-width: 80%; border-collapse: collapse;">
                        <tr>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">fecha:</td>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">${
								details.date_approved?.split("T")[0]
							}</td>
                        </tr>
                        <tr>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">status:</td>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">${
								details.status
							}</td>
                        </tr>
                        <tr>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">subtotal:</td>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">$${details.transaction_amount?.toLocaleString(
								"es-Cl",
							)}</td>
                        </tr>
                        <tr>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">envío:</td>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">$${details.shipping_amount?.toLocaleString(
								"es-Cl",
							)}</td>
                        </tr>
                        <tr>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">total:</td>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">$${details.total_paid_amount?.toLocaleString(
								"es-Cl",
							)}</td>
                        </tr>
                        <tr>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">método de pago:</td>
                            <td style="max-width: 200px; text-align: end; padding: 0px 5px;">Mercado Pago</td>
                        </tr>
                    </table>
                </div>
                <hr style="width: 80%; border-top: 1px solid #ddd" />
                <strong>Productos comprados</strong>
                    <table style="font-size: 13px; max-width: 80%; border-collapse: collapse; margin: 20px;">
                    <tr style="border-bottom:1px solid #ddd">
                        <th>item</th>
                        <th>variedades</th>
                        <th>cantidad</th>
                    </tr>
                    ${table.join("")}
                </table>
                <div class="contacto" style="display: flex; flex-direction: column; justify-items: center; align-items: center; font-size: 13px; padding: 20px 10px; text-align: center; width: 100%;">
                    <strong>contacto</strong>
                    <table style="font-size: 13px; max-width: 80%; border-collapse: collapse;">
                        <tbody>
                            <tr>
                                <td style="max-width: 200px; text-align: end; padding: 0px 5px;">nombre:</td>
                                <td style="max-width: 200px; text-align: end; padding: 0px 5px;">${
									details.payer.name
								}</td>
                            </tr>
                            <tr>
                                <td style="max-width: 200px; text-align: end; padding: 0px 5px;">rut:</td>
                                <td style="max-width: 200px; text-align: end; padding: 0px 5px;">${
									details.payer.identification.number
										? details.payer.identification.number
										: details.payer.identification.id
								}</td>
                            </tr>
                            <tr style="vertical-align: 0q;">
                                <td style="max-width: 200px; text-align: end; padding: 0px 5px;">email:</td>
                                <td style="display: flex; flex-direction: column; justify-items: end; align-items: end;">
                                    <span>${details.payer.email?.split("@")[0]}</span>
                                    <span>@${details.payer.email?.split("@")[1]}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="max-width: 200px; text-align: end; padding: 0px 5px;">teléfono:</td>
                                <td style="max-width: 200px; text-align: end; padding: 0px 5px;">+56 ${details.payer.phone.number?.substring(0, 1)} ${details.payer.phone.number?.substring(1, 5)} ${details.payer.phone.number?.substring(5, 9)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <hr style="width: 80%; border-top: 1px solid #ddd" />
                <div class="contacto" style="display: flex; flex-direction: column; justify-items: center; align-items: center; font-size: 13px; padding: 20px 10px; text-align: center; width: 100%;">
                    <strong>despacho</strong>
                    <span>${details.shipments.street_name} ${details.shipments.street_number}, ${details.shipments.apartment ? "depto:" + details.shipments.apartment + "," : ""} ${details.shipments.city_name}, ${details.shipments.state_name}</span>
                </div>
            </div>
        </div>
        <div class="footer" style="color: #c2c2c2; font-size: 13px; text-align: end;">
            <span>&#169; Up Foods</span> | <span>Pen&#771;a 459, Curico&#769;, Chile | CP: 3341861</span>
        </div>
    </div>
</body>

</html>
`
}

export const getWebMessageTemplate = (data: Email) => {
	return `
<!DOCTYPE>
<html lang="en-US">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
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

<body style="font-family: Verdana; display: flex; flex-direction: column; justify-items: center; align-items: center;">
    <a href="https://bagan.cl">
        <img class="bagan" style="width: 500px;"
            src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,q_auto,c_crop,g_auto,h_500,w_1100/v1/Bagan/naomdbo6nhkvhhv85tal" />
    </a>
    <div class="mensaje" style="padding: 5px;">
        <h2 style=" text-align: center;">${data.nombre}, te ha dejado un mensaje:</h2>
        <div class="caja" style="max-width: 600px; background: #F9B00E; padding: 25px 10px; border-radius: 5px;">
            <div class="mensaje-caja" style="border: 2px solid black; border-radius: 5px; display: flex; flex-direction: column; justify-items: center; align-items: center; background: white;">
                <p class="mensaje-texto" style="padding: 5px;">${data.mensaje}</p>
                <div class="contacto" style="font-size: 13px; padding: 5px; text-align: center; width: 100%; display: flex; flex-direction: column;">
                    <strong>contacto</strong>
                    <span>${data.email}</span>
                    <span>+56 ${data.telefono.substring(0, 1)} ${data.telefono.substring(1, 5)} ${data.telefono.substring(5, 9)}</span>
                </div>
            </div>
        </div>
        <div class="footer" style="color: #c2c2c2; font-size: 13px; text-align: end;">
            <span>&#169; Up Foods</span> | <span>Pen&#771;a 459, Curico&#769;, Chile | 3341861</span>
        </div>
    </div>
</body>
</html>
`
}
