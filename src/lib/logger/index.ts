//  This file reads a env variable set by the program depending on config
// or arguments called SWEETNESS, as defined from config or arguments

import { appendFile } from 'node:fs/promises'
import path from 'node:path'

import type * as colors from './colors.ts'
import * as utils from './utils.ts'

export let SWEETNESS: number = utils.tryNumParse(Bun.env.SWEETNESS, 0)
export let VERBOSE = !!Bun.env.VERBOSE
export let BACKTRACES = Bun.env.BACKTRACES || true
export let LOGFILE: string | null = Bun.env.LOGFILE || null
export function reconfigure(config: {
	sweetness?: number
	verbose?: boolean
	backtraces?: boolean
	logfile?: string | null
}) {
	if (config.sweetness !== undefined) SWEETNESS = config.sweetness
	if (config.verbose !== undefined) VERBOSE = config.verbose
	if (config.backtraces !== undefined) BACKTRACES = config.backtraces
	if (config.logfile !== undefined) LOGFILE = config.logfile
}

export function log(
	style: keyof colors.Interface,
	text: string,
	data: unknown[] = [],
	important = true,
) {
	const print = important || VERBOSE

	let emoji = ''
	if (SWEETNESS > 0) {
		if (style === 'success') emoji = ' ✓ '
		else if (style === 'error') emoji = ' ✗ '
	}

	let outFn: ((str: string) => void) | undefined
	switch (style) {
		case 'error':
			outFn = console.error
			break
		case 'raw':
			outFn = (msg: string) => Bun.write(Bun.stdout, msg)
			break
		default:
			outFn = console.log
			break
	}
	let result =
		utils.format.data(
			text.indexOf('\n') !== -1 ? text : emoji + text,
			style,
			...data,
		) + utils.getColorAnsi('reset')

	if (BACKTRACES) {
		const backtrace = `${utils.getColorAnsi('irrelevant')}[${getCallerBacktrace()}]${utils.getColorAnsi('reset')}`
		const valsLength =
			utils.ansiLength(result.split(/[\n\r]/).pop() || '') +
			utils.ansiLength(backtrace)
		const totalLines = Math.ceil(
			(valsLength + 1) / (process.stdout.columns || 100),
		)
		const size = (process.stdout.columns || 100) * totalLines - valsLength

		result += ' '.repeat(size) + backtrace
	}

	if (print) outFn(result)
	if (LOGFILE) appendFile(LOGFILE, `${Date.now()}: ${result}\n`)

	return utils.ansiLength(result)
}

export function task(text: string, data: unknown[] = [], important = true) {
	if (SWEETNESS !== 3) return { complete: () => {}, fail: () => {} }

	const result = utils.format.data(` ∘ ${text}`, 'info', ...data)
	log('raw', result, [], important)

	return {
		complete: (text: string, data: unknown[] = []) => {
			Bun.write(Bun.stdout, '\x1b[2K\r')
			log('success', text, data, important)
		},
		fail: (text: string, data: unknown[] = []) => {
			Bun.write(Bun.stdout, '\x1b[2K\r')
			log('error', text, data, important)
		},
	}
}

export function logBunSpawn(...args: Parameters<typeof Bun.spawnSync>) {
	log('log', 'running command %', [args[0]])
	const processData = Bun.spawnSync(...args)
	log(processData.exitCode === 0 ? 'log' : 'error', 'process % done (%)', [
		args[0],
		processData.exitCode,
	])
	if (processData.exitCode !== 0)
		log('error', 'stdout: %', [String(processData.stdout.toString())])
	if (processData.exitCode !== 0)
		log('error', 'stderr: %', [String(processData.stderr.toString())])
	return processData
}

const errlineRegex =
	/at\s+(?<name>[^(]+)\s+\((?<filepath>.+):(?<line>\d+):(?<column>\d+)\)/
function getCallerBacktrace(): string {
	const error: { stack: string } = { stack: '' }
	Error.captureStackTrace(error)
	const errline = error.stack
		.split('\n')
		.slice(1)
		.find((stackLine) => stackLine.indexOf(__filename) === -1)

	if (!errline) return ''

	const results = errlineRegex.exec(errline)
	if (!results || !results.groups) return ''

	return `"${results?.groups?.name}" ${path.relative('.', results.groups.filepath)}:${results.groups.line}:${results.groups.column}`
}
