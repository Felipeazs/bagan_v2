import { BlocksRenderer } from "@strapi/blocks-react-renderer"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Await, createFileRoute, defer, getRouteApi, ReactNode } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Autoplay from "embla-carousel-autoplay"
import ReactGA from "react-ga4"
import { toast } from "sonner"

import CarritoLogo from "../assets/carrito.svg"
import { sendEmailContacto } from "@/api"
import { getStrapiHome } from "@/api/strapi"
import { contactoSchema } from "@/server/models/email"
import Carrito from "../components/Carrito"
import Fallback from "../components/Fallback"
import { AspectRatio } from "../components/ui/aspect-ratio"
import { Button } from "../components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card"
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "../components/ui/carousel"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { useCompradorStore } from "../store"

export const Route = createFileRoute("/")({
	loader: async () => {
		const data = getStrapiHome()
		return { strapi_home: defer(data) }
	},
	component: Index,
})

function Index() {
	const comprador = useCompradorStore()
	const route = getRouteApi("/")

	const { strapi_home } = route.useLoaderData()

	const mutation = useMutation({
		mutationFn: sendEmailContacto,
		onSuccess: (data) => {
			if (data) {
				toast("Mensaje enviado", {
					description:
						"Gracias por contactarte con nostros, te responderemos a la brevedad.",
				})

				if (import.meta.env.PROD) {
					ReactGA.event({
						category: "contacto",
						action: "Click",
						label: "mensaje-contacto",
					})
				}
			} else
				toast("Error Servidor", {
					description: "Por favor inténtelo más tarde",
				})
		},
	})

	const form = useForm({
		validatorAdapter: zodValidator(),
		defaultValues: {
			nombre: "",
			apellido: "",
			telefono: "",
			email: "",
			mensaje: "",
		},
		onSubmit: async ({ value }) => {
			mutation.mutate({ value })
			form.reset()
		},
		onSubmitInvalid: () => {
			toast("Atención!", { description: "Por favor ingrese todos los datos" })
		},
	})

	const agregarCarritoHandler = (pack: any) => {
		const newItem = {
			id: pack.pid!,
			title: pack.title!,
			picture_url: pack.images[0].url,
			description: pack.description!,
			quantity: 1,
			unit_price: Number(pack.price),
			weight: pack.weight!,
			details: pack.title === "Tripack" ? Array(3).fill("") : Array(6).fill(""),
		}
		toast(`${newItem.title} agregado al carrito`)
		comprador.guardarItems(newItem)
	}

	return (
		<Await
			promise={strapi_home}
			fallback={<Fallback />}
			children={(home) => (
				<>
					<section className="w-full h-[500px]">
						<AspectRatio
							className="h-[500px] bg-black"
							ratio={16 / 9}>
							<Carousel
								className="ml-0"
								plugins={[Autoplay({ delay: 4000 })]}
								opts={{
									loop: true,
								}}>
								<CarouselContent>
									{home?.hero_images?.map((i) => (
										<CarouselItem
											key={i.id}
											className="pl-0">
											<img
												src={i.url}
												width={100}
												className="w-full h-[500px] object-cover brightness-75"
											/>
										</CarouselItem>
									))}
								</CarouselContent>
							</Carousel>
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
								<p className="text-3xl lg:text-5xl font-title">
									{home?.hero_title}
								</p>
								<p className="text-xl lg:text-2xl font-subtitle">
									{home?.hero_subtitle}
								</p>
							</div>
						</AspectRatio>
					</section>
					<section className="relative w-full">
						<div
							className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 justify-center items-center text-black w-full h-full"
							id="nosotras">
							<div className="relative row-span-2 flex flex-col justify-center items-center gap-5 text-center h-full text-lg p-5">
								<div className="absolute top-0 bg-repeat-x -z-20 bg-cebada w-full h-1/2"></div>
								<div className="absolute -bottom-80 bg-repeat-x -z-10 bg-cebada w-full h-1/2"></div>
								<img
									src={home?.about_image}
									width={300}
									className="object-cover"
								/>
								<div className="md:px-20 pt-5 text-lg">
									{
										<BlocksRenderer
											content={home?.section_about as ReactNode[]}
											modifiers={{
												bold: ({ children }) => (
													<strong className="text-bagan_dark">
														{children}
													</strong>
												),
											}}
										/>
									}
								</div>
							</div>
							<div className="row-span-2 h-full">
								<img
									src={home?.circula_image}
									width={100}
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
					</section>
					<section
						id="productos"
						className="text-black text-center mt-10">
						<p className="text-white font-black uppercase border-2 border-bagan_dark bg-bagan_dark w-full m-auto p-2 text-2xl font-title">
							Nuestros Productos
						</p>
						<div className="w-[90%] m-auto">
							<div className="grid grid-rows-3 lg:grid-rows-1 grid-flow-col justify-center align-center gap-5 mt-10">
								{home?.caracteristicas?.map((c) => (
									<Card
										key={c.id}
										className="relative max-w-[400px] overflow-hidden bg-bagan text-white">
										<CardHeader>
											<CardTitle className="text-center font-subtitle font-bold">
												{c.title}
											</CardTitle>
										</CardHeader>
										<CardContent className="text-sm">
											<BlocksRenderer
												content={c?.description as ReactNode[]}
											/>
										</CardContent>
									</Card>
								))}
							</div>
							<div className="grid grid-rows-3 lg:grid-rows-1 grid-flow-col justify-center align-center gap-5 mt-10">
								{home?.productos?.map((p) => (
									<Card
										key={p.id}
										className="relative max-w-[400px] max-h-[450px] overflow-hidden">
										<CardTitle className="absolute w-max z-20 top-5 left-1/2 -translate-x-1/2 bg-transparent font-title text-3xl text-bagan">
											{p.title}
										</CardTitle>
										<Carousel
											className="relative"
											opts={{
												loop: true,
											}}>
											<CarouselContent>
												{p.images?.map((i) => (
													<CarouselItem
														onPlay={(e) => console.log(e)}
														key={i.id}>
														<img
															src={i.url}
															width={400}
															className="h-[450px] object-cover"
														/>
													</CarouselItem>
												))}
											</CarouselContent>
											<CarouselPrevious className="absolute left-[45%] top-[90%] -translate-x-1/2" />
											<CarouselNext className="absolute left-[55%] top-[90%] -translate-x-1/2" />
										</Carousel>
										<CardFooter className="flex justify-center"></CardFooter>
									</Card>
								))}
							</div>
						</div>
					</section>
					<section
						id="packs"
						className="text-black text-center py-20 px-5">
						<p className="text-bagan font-black uppercase">Packs</p>
						<p className="uppercase font-black">Elige las variedades</p>
						<div className="grid grid-rows-2 lg:grid-rows-1 grid-flow-col justify-center items-center gap-5 mt-16">
							{home?.packs?.map((pack) => (
								<Card
									key={pack.pid}
									className="max-w-[400px] overflow-hidden flex flex-col gap-4">
									<Carousel
										className="relative"
										opts={{ loop: true }}>
										<CarouselContent>
											{pack.images?.map((image) => (
												<CarouselItem key={image.id}>
													<img
														src={image.url}
														width={100}
														className="w-[400px] h-[400px] object-cover"
													/>
												</CarouselItem>
											))}
										</CarouselContent>
										{pack?.images && pack.images.length > 1 && (
											<>
												<CarouselPrevious className="absolute left-[45%] top-[90%] -translate-x-1/2" />
												<CarouselNext className="absolute left-[55%] top-[90%] -translate-x-1/2" />
											</>
										)}
									</Carousel>
									<CardContent>
										<CardDescription className="font-title text-2xl">
											{pack.title}
										</CardDescription>
										<CardDescription className="font-bold">
											precio: {formatCLP(pack?.price)}
										</CardDescription>
										<CardDescription>
											precio unitario: {formatCLP(pack.unit_price)}
										</CardDescription>
									</CardContent>
									<CardFooter className="flex justify-center">
										<Button
											type="button"
											onClick={() => agregarCarritoHandler(pack)}
											className="bg-bagan_dark text-white font-bold"
											variant="outline">
											Agregar al carrito
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					</section>
					<hr />
					<section
						id="contacto"
						className="py-40 grid order-1 grid-rows-2 lg:grid-rows-1 grid-flow-col gap-5 text-black justify-center items-center lg:items-start">
						<div className="w-[300px] md:w-[500px]">
							<p className="text-bagan font-black uppercase">Contacto</p>
							<div className="font-light py-3">
								{home?.contacto?.map((c) => (
									<div
										key={c.id}
										className="flex gap-3 align-center items-center">
										<img
											src={c.image}
											width="24px"
											height="24px"
										/>
										<span>{c.title}</span>
									</div>
								))}
							</div>
							<div>
								<iframe
									src={home?.mapa}
									width="500"
									height="300"
									className="w-[300px] md:w-[500px]"
									loading="lazy"
								/>
							</div>
						</div>
						<form
							onSubmit={async (e) => {
								e.preventDefault()
								e.stopPropagation()
								void form.handleSubmit()
							}}>
							<div className="flex flex-col gap-1 w-[300px] md:w-[500px]">
								<div className="flex gap-1">
									<form.Field
										name="nombre"
										validators={{
											onChange: contactoSchema.shape.nombre,
										}}
										children={(f) => (
											<Input
												type="text"
												id={f.name}
												name={f.name}
												value={f.state.value}
												onBlur={f.handleBlur}
												onChange={(e) => f.handleChange(e.target.value)}
												placeholder="Nombre"
											/>
										)}
									/>
									<form.Field
										name="apellido"
										validators={{
											onChange: contactoSchema.shape.apellido,
										}}
										children={(f) => (
											<Input
												type="text"
												id={f.name}
												name={f.name}
												value={f.state.value}
												onBlur={f.handleBlur}
												onChange={(e) => f.handleChange(e.target.value)}
												placeholder="Apellido"
											/>
										)}
									/>
								</div>
								<div>
									<form.Field
										name="telefono"
										validators={{
											onChange: contactoSchema.shape.telefono,
										}}
										children={(f) => (
											<div className="flex items-center">
												<span className="px-[7px] rounded-md text-stone-400">
													+56
												</span>
												<Input
													type="text"
													id={f.name}
													name={f.name}
													value={f.state.value}
													onBlur={f.handleBlur}
													onChange={(e) => f.handleChange(e.target.value)}
													placeholder="Teléfono"
												/>
											</div>
										)}
									/>
								</div>
								<div>
									<form.Field
										name="email"
										validators={{
											onChange: contactoSchema.shape.email,
										}}
										children={(f) => (
											<>
												<Input
													type="text"
													id={f.name}
													name={f.name}
													value={f.state.value}
													onBlur={f.handleBlur}
													onChange={(e) => f.handleChange(e.target.value)}
													placeholder="Email"
												/>
											</>
										)}
									/>
								</div>
								<div>
									<form.Field
										name="mensaje"
										validators={{
											onChange: contactoSchema.shape.mensaje,
										}}
										children={(f) => (
											<>
												<Textarea
													rows={10}
													id={f.name}
													name={f.name}
													value={f.state.value}
													onBlur={f.handleBlur}
													onChange={(e) => f.handleChange(e.target.value)}
													placeholder="Escribe tu mensaje"
												/>
											</>
										)}
									/>
								</div>
								<form.Subscribe
									selector={(state) => [state.canSubmit, state.isSubmitting]}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											disabled={!canSubmit}
											className="bg-bagan_dark">
											<span className="leading-5 font-bold lg:text-xl tracking-widest">
												{isSubmitting ? "ENVIANDO..." : "ENVIAR"}
											</span>
										</Button>
									)}
								/>
							</div>
						</form>
					</section>
					<hr />
					<section className="grid grid-rows-2 lg:grid-rows-1 grid-flow-col gap-5 justify-center items-center text-black p-5 md:p-10 lg:p-20">
						<div className="text-center">
							<p>Instituciones que nos han apoyado</p>
							<div className="grid grid-rows-1 grid-flow-col gap-2 w-max-[400px]">
								{home?.instituciones?.slice(0, 4).map((institucion) => (
									<img
										src={institucion.url}
										key={institucion.id}
									/>
								))}
							</div>
						</div>
						<div className="text-center">
							<p>Instituciones que nos han financiado</p>
							<div className="grid grid-rows-1 grid-flow-col gap-2 w-max-[400px]">
								{home?.instituciones?.slice(4, 8).map((institucion) => (
									<img
										src={institucion.url}
										key={institucion.id}
									/>
								))}
							</div>
						</div>
					</section>
					{comprador?.items.length > 0 && (
						<div className="fixed bottom-24 right-14 md:bottom-32 md:right-28 bg-bagan w-[50px] h-[50px] rounded-lg hover:shadow-md flex justify-center items-center p-2">
							<Carrito img={CarritoLogo} />
						</div>
					)}
				</>
			)}></Await>
	)
}

export default Index

export const formatCLP = (amount: number | undefined) => {
	if (!amount) return "$0"
	const integerAmount = Math.floor(amount)
	const amountString = integerAmount.toString()

	const formattedAmount = amountString.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

	return `$${formattedAmount}`
}
