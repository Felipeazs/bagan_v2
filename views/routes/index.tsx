import { sendEmailContacto, strapiContent } from "@/api/index"
import { emailSchema } from "@/models/email"
import { Producto } from "@/models/productos"
import { BlocksRenderer } from "@strapi/blocks-react-renderer"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Await, createFileRoute, defer, getRouteApi, ReactNode } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Autoplay from "embla-carousel-autoplay"
import ReactGA from "react-ga4"
import { toast } from "sonner"

import Carrito from "../components/Carrito"
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
import Logo from "../assets/loading.png"

export const Route = createFileRoute("/")({
	loader: async () => {
		const data = strapiContent({
			page: "home",
			query: "?populate=hero_images&populate=productos.images&populate=packs.images&populate=contacto&populate=instituciones.images&populate=caracteristicas",
		})

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
			telefono: "",
			email: "",
			mensaje: "",
		},
		onSubmit: async ({ value }) => {
			mutation.mutate({ value })
			form.reset()
		},
		onSubmitInvalid: () => {
			toast("Por favor ingrese todos los datos")
		},
	})

	const agregarCarritoHandler = (item: Producto) => {
		toast(`${item.title} agregado al carrito`)
		comprador.guardarItems(item)
	}

	return (
		<Await
			promise={strapi_home}
			fallback={
				<div className="flex flex-col justify-center items-center h-dvh text-black font-subtitle">
					<p className="text-2xl">Cargando la página...</p>
					<img src={Logo} width={100} className="w-[300px] object-contain" />
				</div>
			}
			children={(home) => (
				<>
					<section className="w-full h-[500px]">
						<AspectRatio className="h-[500px] bg-black" ratio={16 / 9}>
							<Carousel
								className="ml-0"
								plugins={[Autoplay({ delay: 4000 })]}
								opts={{
									loop: true,
								}}>
								<CarouselContent>
									{home?.hero_images?.map((i: { id: string; url: string }) => (
										<CarouselItem key={i.id} className="pl-0">
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
								<img src={home?.about_image} width={300} className="object-cover" />
								<div className="md:px-20 pt-5 text-lg">
									{<BlocksRenderer content={home?.section_about} />}
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
					<section id="productos" className="text-black text-center mt-10">
						<p className="text-white font-black uppercase border-2 border-bagan_dark bg-bagan_dark w-full m-auto p-2 text-2xl font-title">
							Nuestros Productos
						</p>
						<div className="w-[90%] m-auto">
							<div className="grid grid-rows-3 lg:grid-rows-1 grid-flow-col justify-center align-center gap-5 mt-10">
								{home?.caracteristicas?.map(
									(c: {
										id: string
										title: string
										description: ReactNode[]
									}) => (
										<Card
											key={c.id}
											className="relative max-w-[400px] overflow-hidden bg-bagan text-white">
											<CardHeader>
												<CardTitle className="text-center font-subtitle font-bold">
													{c.title}
												</CardTitle>
											</CardHeader>
											<CardContent className="text-sm">
												<BlocksRenderer content={c?.description} />
											</CardContent>
										</Card>
									),
								)}
							</div>
							<div className="grid grid-rows-3 lg:grid-rows-1 grid-flow-col justify-center align-center gap-5 mt-10">
								{home?.productos?.map(
									(p: {
										id: string
										title: string
										images: { id: string; url: string }[]
									}) => (
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
													{p.images.map((i) => (
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
									),
								)}
							</div>
						</div>
					</section>
					<section id="packs" className="text-black text-center py-20 px-5">
						<p className="text-bagan font-black uppercase">Packs</p>
						<p className="uppercase font-black">Elige las variedades</p>
						<div className="grid grid-rows-2 lg:grid-rows-1 grid-flow-col justify-center items-center gap-5 mt-16">
							{home?.packs?.map(
								(pack: {
									pid: string
									title: string
									price: number
									unit_price: number
									description: string
									weight: number
									images: { id: string; url: string }[]
								}) => (
									<Card
										key={pack.pid}
										className="max-w-[400px] overflow-hidden flex flex-col gap-4">
										<Carousel className="relative" opts={{ loop: true }}>
											<CarouselContent>
												{pack.images.map((image) => (
													<CarouselItem key={image.id}>
														<img
															src={image.url}
															width={100}
															className="w-[400px] h-[400px] object-cover"
														/>
													</CarouselItem>
												))}
											</CarouselContent>
											{pack.images.length > 1 && (
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
												precio: {formatCLP(pack.price)}
											</CardDescription>
											<CardDescription>
												precio unitario: {formatCLP(pack.unit_price)}
											</CardDescription>
										</CardContent>
										<CardFooter className="flex justify-center">
											<Button
												type="button"
												onClick={() =>
													agregarCarritoHandler({
														id: pack.pid,
														title: pack.title,
														picture_url: pack.images[0].url,
														description: pack.description,
														quantity: 1,
														unit_price: Number(pack.price),
														weight: pack.weight,
														details:
															pack.title === "Tripack"
																? Array(3).fill("")
																: Array(6).fill(""),
													})
												}
												className="bg-bagan_dark text-white font-bold"
												variant="outline">
												Agregar al carrito
											</Button>
										</CardFooter>
									</Card>
								),
							)}
						</div>
					</section>
					<hr />
					<section
						id="contacto"
						className="py-40 grid order-1 grid-rows-2 lg:grid-rows-1 grid-flow-col gap-5 text-black justify-center items-center lg:items-start">
						<div className="w-[300px] md:w-[500px]">
							<p className="text-bagan font-black uppercase">Contacto</p>
							<div className="font-light py-3">
								{home?.contacto?.map(
									(c: { id: string; image: string; title: string }) => (
										<div
											key={c.id}
											className="flex gap-3 align-center items-center">
											<img src={c.image} width="24px" height="24px" />
											<span>{c.title}</span>
										</div>
									),
								)}
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
								<div>
									<form.Field
										name="nombre"
										validators={{
											onChange: emailSchema.shape.nombre,
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
								</div>
								<div>
									<form.Field
										name="telefono"
										validators={{
											onChange: emailSchema.shape.telefono,
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
											onChange: emailSchema.shape.email,
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
											onChange: emailSchema.shape.mensaje,
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
								{home?.instituciones?.images
									.slice(0, 4)
									.map((institucion: { id: string; url: string }) => (
										<img src={institucion.url} key={institucion.id} />
									))}
							</div>
						</div>
						<div className="text-center">
							<p>Instituciones que nos han financiado</p>
							<div className="grid grid-rows-1 grid-flow-col gap-2 w-max-[400px]">
								{home?.instituciones?.images
									.slice(4, 8)
									.map((institucion: { id: string; url: string }) => (
										<img src={institucion.url} key={institucion.id} />
									))}
							</div>
						</div>
					</section>
					{comprador?.items.length > 0 && (
						<div className="fixed bottom-24 right-14 md:bottom-32 md:right-28 bg-bagan w-[50px] h-[50px] rounded-lg hover:shadow-md flex justify-center items-center p-2">
							<Carrito />
						</div>
					)}
				</>
			)}></Await>
	)
}

export default Index

export const formatCLP = (amount: number) => {
	const integerAmount = Math.floor(amount)
	const amountString = integerAmount.toString()

	const formattedAmount = amountString.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

	return `$${formattedAmount}`
}
