import { DeepKeys, DeepValue, FieldComponent, Validator } from "@tanstack/react-form"
import { Input } from "./ui/input"
import { FieldInfo } from "./Carrito"
import { Actions, TUsuario, usuarioSchema } from "@/server/models/usuario"

const InputForm = ({
	Field,
	name_field,
	validator_field,
	input_type = "text",
	disabled,
	additional_fx,
}: {
	Field: FieldComponent<{ usuario: TUsuario & Actions }, Validator<DeepValue<TUsuario, string>>>
	name_field: DeepKeys<{ usuario: TUsuario }>
	validator_field: keyof TUsuario
	input_type?: string
	disabled: boolean
	additional_fx?: () => void
}) => {
	return (
		<Field
			name={name_field}
			validators={{
				onChange: usuarioSchema.shape[validator_field],
			}}
			children={(field) => (
				<div className="flex flex-col w-full">
					<Input
						type={input_type}
						name={field.name}
						id={field.name}
						disabled={disabled}
						value={String(field.state.value ?? "")}
						onChange={(e) => {
							field.handleChange(e.target.value)
							if (e.target.name.includes("quantity") && additional_fx) additional_fx()
						}}
					/>
					<FieldInfo field={field} />
				</div>
			)}
		/>
	)
}

export default InputForm
