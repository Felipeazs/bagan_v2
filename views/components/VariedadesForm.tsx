import { DeepValue, FieldComponent, Validator } from "@tanstack/react-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Actions, TUsuario } from "@/server/models/usuario"
import { productoSchema } from "@/server/models/producto"

enum Detail {
	Tomate = "tomate orégano",
	Pesto = "pesto albahaca",
	Pimenton = "pimentón rojo",
}

const VariedadesForm = ({
	Field,
	index,
}: {
	Field: FieldComponent<{ usuario: TUsuario & Actions }, Validator<DeepValue<TUsuario, string>>>
	index: number
}) => {
	return (
		<div className="grid grid-rows-3 sm:grid-cols-2 grid-flow-row gap-1 w-[80%] m-auto">
			<Field
				mode="array"
				name={`usuario.items[${index}].details`}
				validators={{
					onChange: productoSchema.shape.details,
				}}
				children={(field) =>
					field?.state?.value?.map((_, i) => (
						<Field
							key={i}
							name={`usuario.items[${index}].details[${i}]`}
							children={(subfield) => (
								<Select
									value={subfield.state.value}
									onValueChange={(e) => {
										subfield.handleChange(e as Detail)
									}}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={`Variedad ${i + 1}`} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="tomate orégano">
											Tomate Orégano
										</SelectItem>
										<SelectItem value="pesto albahaca">
											Pesto Albahaca
										</SelectItem>
										<SelectItem value="pimentón rojo">Pimentón Rojo</SelectItem>
									</SelectContent>
								</Select>
							)}
						/>
					))
				}
			/>
		</div>
	)
}

export default VariedadesForm
