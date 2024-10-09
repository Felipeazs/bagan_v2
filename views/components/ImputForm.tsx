import { Actions, Comprador, compradorSchema } from '../../db/schema/comprador'
import { DeepKeys, DeepValue, FieldComponent, Validator } from '@tanstack/react-form'
import { Input } from './ui/input'
import { FieldInfo } from './Carrito'

const InputForm = ({
	Field,
	name_field,
	validator_field,
	input_type = 'text',
	additional_fx,
}: {
	Field: FieldComponent<
		{ comprador: Comprador & Actions },
		Validator<DeepValue<Comprador, string>>
	>
	name_field: DeepKeys<{ comprador: Comprador }>
	validator_field: keyof Comprador
	input_type?: string
	additional_fx?: () => void
}) => {
	return (
		<Field
			name={name_field}
			validators={{
				onChange: compradorSchema.shape[validator_field],
			}}
			children={(field) => (
				<div className="flex flex-col w-full">
					<Input
						type={input_type}
						name={field.name}
						id={field.name}
						value={String(field.state.value ?? '')}
						onChange={(e) => {
							field.handleChange(e.target.value)
							if (e.target.name.includes('quantity') && additional_fx) additional_fx()
						}}
					/>
					<FieldInfo field={field} />
				</div>
			)}
		/>
	)
}

export default InputForm
