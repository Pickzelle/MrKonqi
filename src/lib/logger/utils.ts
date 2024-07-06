import type { BunFile } from 'bun'

import { SWEETNESS } from '.'
import * as colors from './colors.ts'

export function tryNumParse(toParse: string | undefined, def: number) {
	if (!toParse) return def
	try {
		return Number.parseInt(toParse)
	} catch (_) {
		return def
	}
}

export function getColorAnsi(style: keyof colors.Interface) {
	return SWEETNESS === 0
		? ''
		: `\x1b[0;${(SWEETNESS === 2 ? colors.collection['16'] : colors.collection['256'])[style]}m`
}

export const format = Object.freeze({
	value: function fmtValue(value: unknown): string {
		if (typeof value === 'string') return `'${value}'`
		if (typeof value === 'number') return value.toString()
		if (value instanceof Blob)
			return fmtValue((value as BunFile).name || String(value))
		if (Array.isArray(value)) return `[ ${value.map(fmtValue).join(', ')} ]`
		return String(value)
	},
	data: function fmtData(
		text: string,
		style: keyof colors.Interface,
		...values: unknown[]
	): string {
		let i = 0
		return (
			getColorAnsi(style) +
			text
				.replace(/(?<=(?:^|[^%])(?:%%)*)%(?=[^%]|$)/g, () => {
					try {
						return `${getColorAnsi('data')}${this.value(values[i++]).replace(/%/g, '%%')}${getColorAnsi(style)}`
					} catch {
						return '�'
					}
				})
				.replace(/(?<=(?:^|[^%])(?:%%)*)%(?=$|[^%])/g, '')
				.replace(/%%/g, '%')
		)
	},
})

export function ansiLength(ansiText: string): number {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: matching \x1B is necessary here
	return ansiText.replace(/\x1b\[[\d;]*m/g, '').length
}
