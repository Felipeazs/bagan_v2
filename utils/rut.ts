export const verifyRut = (enteredRut: string) => {
	let returnValue = false

	const sanitizedRut = enteredRut.replaceAll('.', '')

	const rutLength = sanitizedRut.length

	//rut sin dv
	const rut = sanitizedRut.substring(0, rutLength - 2)
	const dv = sanitizedRut.substring(rutLength - 1).toLowerCase()

	//reverse rut
	const reverseRut = rut.split('').reverse().join('')

	let factor = 2
	let sum = 0
	let res: number
	for (const digit of reverseRut) {
		if (factor <= 7) {
			res = +digit * factor
			sum = sum + res
			factor++
		} else {
			factor = 2
			res = +digit * factor
			sum = sum + res
			factor++
		}
	}

	//obtener el resto de la suma /11
	const rest = sum % 11
	let dv2: number | string = 11 - rest

	if (dv2 === 10) {
		dv2 = 'k'
	} else if (dv2 === 11) {
		dv2 = 0
	}

	if (dv2.toString() === dv) {
		return (returnValue = true)
	}

	return returnValue
}
