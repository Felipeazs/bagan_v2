export const CSP = {
	defaultSrc: ["'self'"],
	baseUri: ["'self'"],
	childSrc: ["'self'"],
	connectSrc: [
		"'self'",
		"data: *.bagan.cl *.mercadolibre.com *.mercadopago.com *.mlstatic.com https://railwayapp-strapi-klwj-dev.up.railway.app/* https://railwayapp-strapi-production-a193.up.railway.app/*",
	],
	fontSrc: ["'self'", "https:", "data:"],
	formAction: ["'self'"],
	frameAncestors: ["'self'", "data: iframe"],
	frameSrc: ["'self'", "data: *.google.com"],
	imgSrc: ["'self'", "data: *.cloudinary.com"],
	manifestSrc: ["'self'"],
	mediaSrc: ["'self'"],
	objectSrc: ["'none'"],
	reportTo: "endpoint-1",
	sandbox: ["allow-same-origin", "allow-scripts", "allow-forms", "allow-popups"],
	scriptSrc: ["'self'", "data: *.googletagmanager.com *.mercadopago.com"],
	scriptSrcAttr: ["'none'"],
	scriptSrcElem: [
		"'self'",
		"data: *.googletagmanager.com/* *.cloudflareinsights.com *.mercadopago.com *.mlstatic.com 'sha256-SF1N+u0m2YmI5B68GiJ90D2BKDGFZ/75ULGb5/aqUmY='",
	],
	styleSrc: ["'self'", "https:", "'unsafe-inline'", "data: "],
	styleSrcAttr: ["data: "],
	styleSrcElem: ["'self'", "https:", "'unsafe-inline'"],
	upgradeInsecureRequests: [],
	workerSrc: ["'self'"],
}
