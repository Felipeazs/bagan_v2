import Logo from "../assets/loading.png"

const Fallback = () => {
	return (
		<div className="flex flex-col justify-center items-center h-dvh text-black font-subtitle">
			<p className="text-2xl">Cargando la página...</p>
			<img src={Logo} width={100} className="w-[300px] object-contain" />
		</div>
	)
}

export default Fallback
