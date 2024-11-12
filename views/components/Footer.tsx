import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-form-adapter"

import { addToNewsletter } from "@/api"
import { newsletterSchema } from "@/server/models/email"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const Footer = () => {
	const mutation = useMutation({
		mutationKey: ["newsletter"],
		mutationFn: addToNewsletter,
		onSuccess: (data) => {
			if (data && data.status) {
				toast("Felicidades!", { description: "Has sido agregado a nuestro Newsletter" })
			} else {
				toast("Error de servidor", { description: "Por favor inténtalo más tarde" })
			}
		},
	})

	const form = useForm({
		validatorAdapter: zodValidator(),
		defaultValues: {
			nombre: "",
			apellido: "",
			email: "",
		},
		onSubmit: async ({ value }) => {
			mutation.mutate({ value })
			form.reset()
		},
		onSubmitInvalid: () => {
			toast("Atención!", { description: "Por favor ingrese su datos" })
		},
	})

	const hover_style = "hover:text-bagan_dark"

	return (
		<div
			className="flex flex-col-reverse sm:flex-row justify-around items-center sm:items-start gap-5 px-5 py-10 bg-bagan text-white"
			id="newsletter">
			<div className="flex flex-col items-center sm:justify-start sm:items-start">
				<p className="uppercase font-bold">Información y políticas</p>
				<Link
					to="/informaciones/$informacion"
					params={{ informacion: "preguntas_frecuentes" }}
					disabled={true}
					className={hover_style}>
					Preguntas frecuentes
				</Link>
				<Link
					to="/informaciones/$informacion"
					params={{ informacion: "politicas_envio" }}
					className={hover_style}>
					Políticas de envío
				</Link>
				<Link
					to="/informaciones/$informacion"
					params={{ informacion: "terminos_condiciones" }}
					className={hover_style}>
					Términos y Condiciones
				</Link>
				<Link
					to="/informaciones/$informacion"
					params={{ informacion: "cambios_devoluciones" }}
					className={hover_style}>
					Cambios y Devoluciones
				</Link>
				<Link
					to="/informaciones/$informacion"
					params={{ informacion: "privacidad_datos" }}
					className={hover_style}>
					Privacidad de datos
				</Link>
			</div>
			<div className="flex flex-col gap-5 min-w-[300px] max-w-[380px]">
				<form
					className="flex flex-col gap-1 text-black"
					onSubmit={async (e) => {
						e.preventDefault()
						e.stopPropagation()
						void form.handleSubmit()
					}}>
					<div className="flex gap-1">
						<form.Field
							name="nombre"
							validators={{ onChange: newsletterSchema.shape.nombre }}
							children={(field) => (
								<Input
									type="text"
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Nombre"
								/>
							)}
						/>
						<form.Field
							name="apellido"
							validators={{ onChange: newsletterSchema.shape.apellido }}
							children={(field) => (
								<Input
									type="text"
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Apellido"
								/>
							)}
						/>
					</div>
					<form.Field
						name="email"
						validators={{ onChange: newsletterSchema.shape.email }}
						children={(field) => (
							<Input
								type="text"
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Email"
							/>
						)}
					/>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit]) => (
							<Button
								type="submit"
								disabled={!canSubmit}
								className="bg-bagan_dark font-bold">
								Newsletter
							</Button>
						)}
					/>
				</form>
				<p className="text-center font-bold">
					Bagan.cl 2024 | Todos los derechos reservados
				</p>
			</div>
		</div>
	)
}

export default Footer
