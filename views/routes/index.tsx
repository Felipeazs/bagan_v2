import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Autoplay from "embla-carousel-autoplay"
import { toast } from "sonner"
import { sendEmailContacto, strapiContent } from "../../api/index"
import { emailSchema } from "../../db/schema/email"
import { Producto } from "../../db/schema/productos"
import Carrito from "../components/Carrito"
import { AspectRatio } from "../components/ui/aspect-ratio"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "../components/ui/card"
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "../components/ui/carousel"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { hero, packs, productos } from "../productos"
import { useCompradorStore } from "../store"

export const Route = createFileRoute("/")({
	component: Index,
})

function Index() {
	const { data: home_data, isSuccess } = useQuery({
		queryKey: ["home-content"],
		queryFn: () => strapiContent("home"),
		staleTime: Infinity,
	})

	const about: BlocksContent = home_data?.section_about ?? []
	const circula: BlocksContent = home_data?.section_circula ?? []

	const comprador = useCompradorStore()

	const mutation = useMutation({
		mutationFn: sendEmailContacto,
		onSuccess: (data) => {
			if (data) {
				toast("Mensaje enviado", {
					description:
						"Gracias por contactarte con nostros, te responderemos a la brevedad.",
				})
			} else
				toast("Error Servidor", {
					description: "Por favor, inténtelo más tarde",
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
			toast("Por favor, ingrese todos los datos")
		},
	})

	const agregarCarritoHandler = (item: Producto) => {
		toast(`${item.title} agregado al carrito`)
		comprador.guardarItems(item)
	}

	return (
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
							{hero.map((i, index) => (
								<CarouselItem key={index} className="pl-0">
									<img
										src={i}
										width={100}
										className="w-full h-[500px] object-cover brightness-75"
									/>
								</CarouselItem>
							))}
						</CarouselContent>
					</Carousel>
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
						<p className="text-3xl lg:text-5xl font-title">{home_data?.hero_title}</p>
						<p className="text-xl lg:text-2xl font-subtitle">
							{home_data?.hero_subtitle}
						</p>
						<Button className="hidden md:inline mt-5 md:mt-20 bg-bagan_dark">
							<a href="#nosotras">
								<span className="leading-5 font-bold lg:text-xl tracking-widest">
									NOSOTRAS
								</span>
							</a>
						</Button>
					</div>
				</AspectRatio>
			</section>
			<section className="relative">
				<div
					className="grid grid-rows-3 lg:grid-rows-2 grid-flow-col text-black"
					id="nosotras">
					<div className="flex flex-col justify-center align-center md:h-[500px] text-center">
						<p className="text-bagan font-black uppercase">Sobre</p>
						<p className="uppercase font-black">Nosotras</p>
						<div className="px-20 pt-5 text-[15px]">
							{isSuccess && <BlocksRenderer content={about} />}
						</div>
					</div>
					<div className="flex flex-col justify-center align-center h-[500px] text-center">
						<img
							src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/gxlqnmn4kwaw8ovwwa9n"
							width={100}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="hidden lg:flex flex-col justify-center align-center md:h-[500px] text-center">
						<img
							src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/dixb9adwlg6xow3mbidz"
							width={100}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="flex flex-col justify-center align-center md:h-[500px] text-center">
						<p className="text-bagan font-black uppercase">Circular</p>
						<div className="px-20 pt-5 text-[15px]">
							{isSuccess && <BlocksRenderer content={circula} />}
						</div>
					</div>
				</div>
				<Button className="hidden lg:inline absolute left-1/2 -translate-x-1/2 bottom-10 lg:mt-40 bg-bagan_dark">
					<a href="#productos">
						<span className="leading-5 font-bold lg:text-xl tracking-widest">
							PRODUCTOS
						</span>
					</a>
				</Button>
			</section>
			<section id="productos" className="text-black text-center pt-40 px-5">
				<p className="text-black font-black uppercase">Nuestros Productos</p>
				<div className="grid grid-rows-3 lg:grid-rows-1 grid-flow-col justify-center align-center gap-5 mt-16">
					{productos?.map((p, i) => (
						<Card
							key={i}
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
									{p.image.map((i, index) => (
										<CarouselItem key={index}>
											<img
												src={i}
												width={100}
												className="w-[400px] h-[450px] object-cover"
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
			</section>
			<section id="packs" className="text-black text-center py-20 px-5">
				<p className="text-bagan font-black uppercase">Packs</p>
				<p className="uppercase font-black">Elige las variedades</p>
				<div className="grid grid-rows-3 lg:grid-rows-1 grid-flow-col justify-center align-center gap-5 mt-16">
					{packs?.map((p, i) => (
						<Card key={i} className="max-w-[400px] overflow-hidden flex flex-col gap-4">
							<Carousel className="relative" opts={{ loop: true }}>
								<CarouselContent>
									{p.image.map((i, index) => (
										<CarouselItem key={index}>
											<img
												src={i}
												width={100}
												className="w-[400px] h-[400px] object-cover"
											/>
										</CarouselItem>
									))}
								</CarouselContent>
								{p.image.length > 1 && (
									<>
										<CarouselPrevious className="absolute left-[45%] top-[90%] -translate-x-1/2" />
										<CarouselNext className="absolute left-[55%] top-[90%] -translate-x-1/2" />
									</>
								)}
							</Carousel>
							<CardContent>
								<CardDescription className="font-title text-2xl">
									{p.title}
								</CardDescription>
								<CardDescription className="font-bold">
									precio: ${p.unit_price.toLocaleString("es-Cl")}
								</CardDescription>
								<CardDescription>{p.description}</CardDescription>
							</CardContent>
							<CardFooter className="flex justify-center">
								<Button
									onClick={() =>
										agregarCarritoHandler({
											...p,
											picture_url: p.image[0],
											quantity: 1,
											details:
												p.title === "Tripack"
													? Array(3).fill("")
													: Array(6).fill(""),
											weight: p.title === "Tripack" ? 750 : 1500,
										})
									}
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
					<div className="font-light">
						<a
							href="whatsapp://send?text=Hola!&phone=+56936652590"
							className="flex gap-3 align-center items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 24 24">
								<path
									fill="#F9B00E"
									d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23c-1.48 0-2.93-.39-4.19-1.15l-.3-.17l-3.12.82l.83-3.04l-.2-.32a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31c-.22.25-.87.86-.87 2.07c0 1.22.89 2.39 1 2.56c.14.17 1.76 2.67 4.25 3.73c.59.27 1.05.42 1.41.53c.59.19 1.13.16 1.56.1c.48-.07 1.46-.6 1.67-1.18s.21-1.07.15-1.18c-.07-.1-.23-.16-.48-.27c-.25-.14-1.47-.74-1.69-.82c-.23-.08-.37-.12-.56.12c-.16.25-.64.81-.78.97c-.15.17-.29.19-.53.07c-.26-.13-1.06-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.12-.24-.01-.39.11-.5c.11-.11.27-.29.37-.44c.13-.14.17-.25.25-.41c.08-.17.04-.31-.02-.43c-.06-.11-.56-1.35-.77-1.84c-.2-.48-.4-.42-.56-.43c-.14 0-.3-.01-.47-.01"
								/>
							</svg>
							<span>+56 9 3665 2590</span>
						</a>
						<div className="flex gap-3 align-center items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 32 32">
								<path
									fill="#F9B00E"
									d="M28 6H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2m-2.2 2L16 14.78L6.2 8ZM4 24V8.91l11.43 7.91a1 1 0 0 0 1.14 0L28 8.91V24Z"
								/>
							</svg>
							<p>ventas@bagan.cl</p>
						</div>
						<div className="flex gap-3 align-center items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 32 32">
								<path
									fill="#F9B00E"
									d="M16 18a5 5 0 1 1 5-5a5.006 5.006 0 0 1-5 5m0-8a3 3 0 1 0 3 3a3.003 3.003 0 0 0-3-3"
								/>
								<path
									fill="#F9B00E"
									d="m16 30l-8.436-9.949a35 35 0 0 1-.348-.451A10.9 10.9 0 0 1 5 13a11 11 0 0 1 22 0a10.9 10.9 0 0 1-2.215 6.597l-.001.003s-.3.394-.345.447ZM8.813 18.395s.233.308.286.374L16 26.908l6.91-8.15c.044-.055.278-.365.279-.366A8.9 8.9 0 0 0 25 13a9 9 0 1 0-18 0a8.9 8.9 0 0 0 1.813 5.395"
								/>
							</svg>
							<p>Peña 459, local 08, Curicó</p>
						</div>
						<div className="flex gap-3 align-center items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 24 24">
								<path
									fill="#F9B00E"
									d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
								/>
							</svg>
							<p>@bagan.cl</p>
						</div>
					</div>
					<div>
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3268.8093463224222!2d-71.24391032314176!3d-34.98643997781334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966457080ad99b75%3A0x5f249ef0b0f1585f!2zUGXDsWEgNDU5LCAzMzQxODYzIEN1cmljw7MsIE1hdWxl!5e0!3m2!1ses!2scl!4v1725750888467!5m2!1ses!2scl"
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
						<img src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/st4gaxyxp6sut7brkwmt" />
						<img src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/o3otkini22zbk9i3gtnt" />
						<img src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/dlvuzn3rmv54hgxhsfs9" />
						<img src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/xsj60wivoyzio6ocfw5y" />
					</div>
				</div>
				<div className="text-center">
					<p>Instituciones que nos han financiado</p>
					<div className="grid grid-rows-1 grid-flow-col gap-2 w-max-[400px]">
						<img src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/pvgpwc99cmxyoj7oadeo" />
						<img src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/ovew5wn1xgebowhyy8di" />
						<img src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/tsxcfgnidqqkcgdoioqs" />
						<img src="https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/afixy1woytjbjaajtoga" />
					</div>
				</div>
			</section>
			{comprador?.items.length > 0 && (
				<div className="fixed bottom-24 right-14 md:bottom-32 md:right-28 bg-bagan w-[50px] h-[50px] rounded-lg justify-center items-center py-2 px-2 hover:shadow-md">
					<Carrito />
				</div>
			)}
		</>
	)
}

export default Index
