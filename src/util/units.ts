const magnitude_prefix_m = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z']
const magnitude_prefix_b = magnitude_prefix_m.map(v => v ? `${v}i` : '')

export function hsize_m(bytes: number, precission = 2) {
	const norm_size = normalize_magnitude(
		bytes,
		1000,
		magnitude_prefix_m.length - 1,
	)
	return `${norm_size[0].toFixed(precission)} ${magnitude_prefix_m[norm_size[1]]}B`
}

export function hsize_b(bytes: number, precission = 2) {
	const norm_size = normalize_magnitude(
		bytes,
		1024,
		magnitude_prefix_m.length - 1,
	)
	return `${norm_size[0].toFixed(precission)} ${magnitude_prefix_b[norm_size[1]]}B`
}

export function normalize_magnitude(
	ammount: number,
	radix: number,
	max: number = Number.POSITIVE_INFINITY,
) {
	let remaining = ammount

	let unitIndex = 0
	while (remaining >= radix && unitIndex < max) {
		remaining /= radix
		unitIndex++
	}

	return [remaining, unitIndex]
}
