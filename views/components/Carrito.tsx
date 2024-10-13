import { createMPPreferences } from "@/api"
import { compradorSchema } from "@/models/comprador"
import { calcularTarifa } from "@/utils/tarifa"
import { Wallet } from "@mercadopago/sdk-react"
import { FieldApi, useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useEffect, useState } from "react"
import ReactGA from "react-ga4"
import { toast } from "sonner"
import CarritoLogo from "../assets/carrito.svg"
import { useCompradorStore } from "../store"
import InputForm from "./InputForm"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Separator } from "./ui/separator"
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet"
import VariedadesForm from "./VariedadesForm"

import { chile } from "@/utils/chile"

const regiones = chile.map((c) => {
	return {
		id: c.id,
		title: c.name,
		value: c.value,
		comunas: c.provincias.map((p) => p.comunas),
	}
})

const Carrito = () => {
	const comprador = useCompradorStore()

	const [step, setStep] = useState<{ title: string; page: number }>({
		title: "Carrito",
		page: 1,
	})
	const [comunas, setComunas] = useState<string[]>([])
	const [subtotal, setSubtotal] = useState<number>(0)
	const [preferenceId, setPreferenceId] = useState<string>("")
	const [disable, setDisable] = useState<boolean>(false)

	const mutation = useMutation({
		mutationFn: createMPPreferences,
		onSuccess: (data) => {
			if (data?.success === false) return toast(data.error.issues[0].message)
			else if (data) {
				setPreferenceId(data.prefId)
				if (import.meta.env.PROD) {
					ReactGA.event({
						category: "venta",
						action: "Click",
						label: "mercadopago",
					})
				}
			} else toast("Error del servidor, por favor inténtalo más tarde.")
		},
	})

	const form = useForm({
		validatorAdapter: zodValidator(),
		defaultValues: {
			comprador,
		},
		onSubmit: async ({ value }) => {
			mutation.mutate({ value: value.comprador })
		},
		onSubmitInvalid: () => {
			toast("Por favor rellena todos los campos")
		},
	})

	useEffect(() => {
		const carrito = form.getFieldValue("comprador.items").length
		const items = comprador.items.length

		if (items > carrito) {
			form.pushFieldValue("comprador.items", comprador.items[comprador.items.length - 1])
		}
		sumSubtotalDespacho()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comprador.items])

	const sumSubtotalDespacho = () => {
		const region = form.getFieldValue("comprador.direccion.region")
		const items = form.getFieldValue("comprador.items")
		const tarifa = calcularTarifa(region, items)

		comprador.setEnvio(tarifa.precio_envio)

		if (tarifa.error) {
			setDisable(true)
			setSubtotal(0)
			toast(tarifa.error)
			return
		}
		setDisable(false)

		if (tarifa.precio_envio > 0) {
			form.setFieldValue("comprador.envio", tarifa.precio_envio)
		}

		const existingItems = form.getFieldValue("comprador.items")
		const itemPrices = existingItems.map((i) => i.quantity * i.unit_price)
		const sumPrices = itemPrices.reduce((a, b) => a + b, 0)

		setSubtotal(isNaN(sumPrices) || sumPrices < 1 ? 0 : sumPrices)
	}

	const handleComunas = (region: string) => {
		const data_regiones = regiones.find((r) => r.title === region)!.comunas

		let comunas: string[] = []
		data_regiones.forEach((dr) => {
			dr.forEach((cc) => {
				comunas = [...comunas, cc.name]
			})
		})

		form.setFieldValue("comprador.direccion.comuna", "")

		form.setFieldMeta("comprador.direccion.comuna", {
			isTouched: false,
			isPristine: true,
			isDirty: false,
			isValidating: false,
			errors: [],
			errorMap: {},
			isBlurred: false,
		})
		setComunas(comunas)
	}

	return (
		<Sheet>
			<SheetTrigger className="flex justify-center w-full h-full">
				<div className="relative h-[20px] w-[50px]">
					<img src={CarritoLogo} />
					<span className="absolute z-10 top-1/2 left-3 flex justify-center items-center text-gray-500 text-[14px] font-bold bg-transparent border-2 border-gray-500 w-[22px] h-[22px] rounded-full">
						{comprador.items.length}
					</span>
				</div>
			</SheetTrigger>
			<SheetContent className="overflow-y-auto flex flex-col h-full">
				<SheetTitle>{step.title}</SheetTitle>
				{comprador?.items?.length ? (
					<form
						className="flex flex-col gap-16 md:gap-0 justify-between"
						onSubmit={async (e) => {
							e.preventDefault()
							e.stopPropagation()
							void form.handleSubmit()
						}}>
						<div className="flex flex-col justify-between h-full">
							{step.page === 1 ? (
								<form.Field
									mode="array"
									name="comprador.items"
									children={(field) => (
										<div className="flex flex-col gap-10">
											{field.state.value?.map((p, i) => (
												<div key={i} className="flex flex-col gap-2">
													<div className="grid grid-rows-2 justify-center gap-5 min-h-[175px] sm:grid-rows-1 grid-flow-col">
														<img
															src={p.picture_url}
															width={220}
															height={170}
															className="w-[220px] h-[170px] object-cover"
														/>
														<div>
															<SheetHeader>
																<SheetDescription>
																	{p.title} - Bagan!
																</SheetDescription>
															</SheetHeader>
															<div className="text-sm text-gray-500">
																<p>
																	precio: $
																	{p.unit_price?.toLocaleString(
																		"es-Cl",
																	)}
																</p>
															</div>

															<form.Field
																name={`comprador.items[${i}].quantity`}
																children={(field) => (
																	<div className="flex flex-col">
																		<Input
																			type="number"
																			pattern={
																				"^(0|[1-9][0-9]*)$"
																			}
																			name={field.name}
																			id={field.name}
																			onBlur={
																				field.handleBlur
																			}
																			value={
																				field.state.value
																			}
																			onChange={(e) => {
																				field.handleChange(
																					Number(
																						e.target
																							.value,
																					),
																				)
																				sumSubtotalDespacho()
																			}}
																		/>
																		<FieldInfo field={field} />
																	</div>
																)}
															/>
															<SheetFooter className="mt-1">
																<Button
																	type="button"
																	variant={"outline"}
																	onClick={() => {
																		form.removeFieldValue(
																			"comprador.items",
																			i,
																		)
																		comprador.quitarItems(i)
																	}}>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		width="1em"
																		height="1em"
																		viewBox="0 0 256 256">
																		<path
																			fill=""
																			d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16M96 40a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0m48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0"
																		/>
																	</svg>
																</Button>
															</SheetFooter>
														</div>
													</div>
													<SheetDescription className="text-center">
														Elige las variedades del {p.title}*
													</SheetDescription>
													<VariedadesForm Field={form.Field} index={i} />
													<Separator className="my-4" />
												</div>
											))}
										</div>
									)}
								/>
							) : (
								<div className="flex flex-col gap-1">
									<p className="py-2 font-bold">Datos de envío</p>
									<div className="grid grid-rows-2 grid-flow-row md:grid-cols-2 gap-1">
										<Label>
											Nombre*
											<InputForm
												Field={form.Field}
												name_field="comprador.nombre"
												validator_field="nombre"
											/>
										</Label>
										<Label>
											Apellido*
											<InputForm
												Field={form.Field}
												name_field="comprador.apellido"
												validator_field="apellido"
											/>
										</Label>
										<Label>
											Rut{" "}
											<span className="text-xs">
												(sin puntos y con guión)*
											</span>
											<InputForm
												Field={form.Field}
												name_field="comprador.rut"
												validator_field="rut"
											/>
										</Label>
										<Label>
											Teléfono*
											<div className="flex justify-between items-start">
												<span className="py-[12px] px-1 rounded-md text-stone-400">
													+56
												</span>
												<InputForm
													Field={form.Field}
													name_field="comprador.telefono"
													validator_field="telefono"
												/>
											</div>
										</Label>
										<Label>
											Email*
											<InputForm
												Field={form.Field}
												name_field="comprador.email"
												validator_field="email"
											/>
										</Label>
									</div>
									<p className="py-2 font-bold">Dirección</p>
									<div className="grid grid-rows-2 grid-flow-row md:grid-cols-2 gap-1">
										<Label>
											Calle*
											<form.Field
												name="comprador.direccion.calle"
												children={(field) => (
													<>
														<Input
															type="text"
															name={field.name}
															id={field.name}
															value={field.state.value}
															onChange={(e) => {
																field.handleChange(e.target.value)
															}}
														/>
														<FieldInfo field={field} />
													</>
												)}
												validators={{
													onChange:
														compradorSchema.shape.direccion.shape.calle,
												}}
											/>
										</Label>
										<Label>
											Número*
											<form.Field
												name="comprador.direccion.numero"
												children={(field) => (
													<>
														<Input
															type="text"
															name={field.name}
															id={field.name}
															value={field.state.value}
															onChange={(e) => {
																field.handleChange(e.target.value)
															}}
														/>
														<FieldInfo field={field} />
													</>
												)}
												validators={{
													onChange:
														compradorSchema.shape.direccion.shape
															.numero,
												}}
											/>
										</Label>
										<Label>
											Depto/Casa (opcional)
											<form.Field
												name="comprador.direccion.depto"
												children={(field) => (
													<>
														<Input
															type="text"
															name={field.name}
															id={field.name}
															value={field.state.value}
															onChange={(e) => {
																field.handleChange(e.target.value)
															}}
														/>
														<FieldInfo field={field} />
													</>
												)}
												validators={{
													onChange:
														compradorSchema.shape.direccion.shape.depto,
												}}
											/>
										</Label>
										<Label>
											Región*
											<form.Field
												name="comprador.direccion.region"
												children={(field) => (
													<>
														<Select
															value={field.state.value}
															onValueChange={(e) => {
																field.handleChange(e)
																handleComunas(e)
																sumSubtotalDespacho()
															}}>
															<SelectTrigger className="w-full">
																<SelectValue placeholder="Seleccione la región" />
															</SelectTrigger>
															<SelectContent>
																{regiones.map((region, i) => (
																	<SelectItem
																		key={i}
																		value={region.title}>
																		{region.title}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FieldInfo field={field} />
													</>
												)}
												validators={{
													onChange:
														compradorSchema.shape.direccion.shape
															.region,
												}}
											/>
										</Label>
										<Label>
											Comuna*
											<form.Field
												name="comprador.direccion.comuna"
												children={(field) => (
													<>
														<Select
															defaultValue={field.state.value}
															onValueChange={(e) => {
																field.handleChange(e)
															}}>
															<SelectTrigger className="w-full">
																<SelectValue placeholder="Seleccione la comuna" />
															</SelectTrigger>
															<SelectContent>
																{comunas.map((comuna, i) => (
																	<SelectItem
																		key={i}
																		value={comuna}>
																		{comuna}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FieldInfo field={field} />
													</>
												)}
												validators={{
													onChange:
														compradorSchema.shape.direccion.shape
															.comuna,
												}}
											/>
										</Label>
									</div>
								</div>
							)}
						</div>
						<div className="pt-10 md:pt-20">
							<p className="font-bold">
								Subtotal: ${subtotal.toLocaleString("es-Cl")}
							</p>
							{step.page === 2 && (
								<>
									<p className="font-bold">
										Costo de envío:{" "}
										{comprador?.envio === 0 ? (
											<span className="font-light italic text-sm text-bagan">
												ingresa los datos de despacho
											</span>
										) : (
											`${comprador.envio?.toLocaleString("es-Cl") ?? "0"}`
										)}
									</p>
									<p className="font-bold">
										Total: $
										{(subtotal + comprador.envio).toLocaleString("es-Cl")}
									</p>
								</>
							)}
							<Separator className="my-4" />
							{preferenceId && step.page === 2 ? (
								<div className="flex flex-col gap-1">
									<Wallet
										initialization={{ preferenceId }}
										onReady={() => true}
										customization={{
											texts: {
												action: "buy",
												valueProp: "payment_methods_logos",
											},
										}}
									/>
									<Button
										onClick={() => {
											setPreferenceId("")
											setStep({ title: "Carrito", page: 1 })
										}}
										type="button">
										MODIFICAR CARRITO
									</Button>
								</div>
							) : !preferenceId && step.page === 2 ? (
								<div className="flex flex-col gap-1">
									<form.Subscribe
										selector={(state) => [state.canSubmit, state.isSubmitting]}
										children={([canSubmit, isSubmitting]) => (
											<Button
												type="submit"
												disabled={!canSubmit}
												className="mt-[16px] bg-bagan font-black">
												{isSubmitting ? "PROCESANDO..." : "CONTINUAR"}
											</Button>
										)}
									/>
									<Button
										className="bg-bagan_dark font-bold"
										onClick={() => {
											setStep({ title: "Carrito", page: 1 })
										}}>
										VOLVER
									</Button>
									<SheetClose asChild>
										<Button
											type="button"
											onClick={() => {
												setStep({ title: "Carrito", page: 1 })
											}}>
											SEGUIR COMPRANDO
										</Button>
									</SheetClose>
								</div>
							) : (
								<div className="flex flex-col gap-1">
									<Button
										type="button"
										className="bg-bagan font-bold"
										disabled={disable}
										onClick={() => {
											setStep({ title: "Despacho", page: 2 })
										}}>
										CONTINUAR
									</Button>

									<SheetClose asChild>
										<Button
											type="button"
											onClick={() => {
												setStep({ title: "Carrito", page: 1 })
											}}>
											SEGUIR COMPRANDO
										</Button>
									</SheetClose>
								</div>
							)}
							<div className="flex justify-end">
								<img
									src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,q_auto,e_bgremoval:ffffff/v1/Bagan/naomdbo6nhkvhhv85tal"
									width={100}
								/>
							</div>
						</div>
					</form>
				) : (
					<SheetDescription>Agregue productos</SheetDescription>
				)}
			</SheetContent>
		</Sheet>
	)
}

export default Carrito

//eslint-disable-next-line
export function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
	return (
		<>
			{field.state.meta.errors.length ? (
				<span className="text-xs text-bagan_dark">{field.state.meta.errors.join(",")}</span>
			) : (
				<span className="text-xs text-white">.</span>
			)}
		</>
	)
}
