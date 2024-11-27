import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"

import Debito from "../assets/debito.svg"
import Mastercard from "../assets/mastercard.svg"
import Mercadopago from "../assets/mercadopago.svg"
import Visa from "../assets/visa.svg"
import Fintoc from "../assets/fintoc.svg"

const medios = [
	{
		id: 2,
		title: "Mercado Pago",
		value: "mercadopago",
		tipos: [
			{
				id: 1,
				name: "mercadopago",
				image: Mercadopago,
			},
			{
				id: 2,
				name: "visa",
				image: Visa,
			},
			{
				id: 3,
				name: "mastercad",
				image: Mastercard,
			},
			{
				id: 4,
				name: "debito",
				image: Debito,
			},
		],
	},
	{
		id: 1,
		title: "Ventipay",
		value: "ventipay",
		tipos: [
			{
				id: 1,
				name: "visa",
				image: Visa,
			},
			{
				id: 2,
				name: "mastercad",
				image: Mastercard,
			},
			{
				id: 3,
				name: "debito",
				image: Debito,
			},
		],
	},
	{
		id: 3,
		title: "Fintoc",
		value: "fintoc",
		tipos: [
			{
				id: 1,
				name: "fintoc",
				image: Fintoc,
			},
		],
	},
]

const MediosPago = ({
	defaultValue,
	onchange,
}: {
	defaultValue: string
	onchange: (e: any) => void
}) => {
	return (
		<div>
			<RadioGroup
				onValueChange={(e) => onchange(e)}
				defaultChecked={true}
				defaultValue={defaultValue}>
				{medios.map((m) => (
					<div
						key={m.id}
						className="flex justify-between">
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value={m.value}
								id={m.value}
							/>
							<Label htmlFor={m.value}>{m.title}</Label>
						</div>
						<div className="flex items-center space-x-2 h-[30px]">
							{m.tipos.map((t) => (
								<img
									key={t.id}
									src={t.image}
									width={30}
									height={30}
								/>
							))}
						</div>
					</div>
				))}
			</RadioGroup>
		</div>
	)
}

export default MediosPago
