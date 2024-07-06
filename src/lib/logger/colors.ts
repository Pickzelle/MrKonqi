export interface Interface {
	reset: string
	raw: string

	log: string
	irrelevant: string

	error: string
	warn: string
	iwarn: string
	info: string
	success: string

	data: string
	debug: string
}

export const collection: { [k: string]: Interface } = Object.freeze({
	'16': {
		reset: '0',
		raw: '',

		log: '0',
		irrelevant: '90',

		error: '1;31',
		warn: '1;33',
		iwarn: '1;43;31',
		info: '34',
		success: '1;32',

		data: '1;4;35',
		debug: '36',
	},
	'256': {
		reset: '0',
		raw: '',

		log: rgb(236, 240, 241),
		irrelevant: rgb(127, 140, 141),

		error: `1;${rgb(231, 76, 60)}`,
		warn: `1;${rgb(230, 126, 34)}`,
		iwarn: `1;${brgb(230, 126, 34)};${rgb(231, 76, 60)}`,
		info: rgb(241, 196, 15),
		success: `1;${rgb(46, 204, 113)}`,

		data: `1;4;${rgb(142, 68, 173)}`,
		debug: rgb(52, 152, 219),
	},
})

function rgb(r: number, g: number, b: number) {
	return `38;2;${r};${g};${b}`
}
function brgb(r: number, g: number, b: number) {
	return `48;2;${r};${g};${b}`
}
