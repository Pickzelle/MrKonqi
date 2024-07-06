import type { BunFile } from 'bun'
import { log } from '#lib/logger'
import { format } from '#lib/logger/utils'
const helpSeparation = 3

const commandLineArgs = require('command-line-args')

interface optionsResultInterface {
	help: boolean
	verbose: boolean
	version: boolean

	config: BunFile
	sweetness: number

	[key: string]: unknown
}

type optionDefinitionsType<T> = Array<
	| {
			name: keyof optionsResultInterface
			alias?: string
			type: new () => T
			defaultOption: T
			description: string
	  }
	| {
			name: keyof optionsResultInterface
			alias?: string
			type: T
			defaultOption: T
			description: string
	  }
>

export const optionDefinitions: Readonly<optionDefinitionsType<unknown>> =
	Object.freeze([
		{
			name: 'help',
			alias: 'h',
			type: Boolean,
			defaultOption: false,
			description: 'Prints help menu',
		},
		{
			name: 'verbose',
			alias: 'V',
			type: Boolean,
			defaultOption: false,
			description: 'Runs on verbose mode',
		},
		{
			name: 'version',
			alias: 'v',
			type: Boolean,
			defaultOption: false,
			description: 'Prints version',
		},

		{
			name: 'config',
			alias: 'c',
			type: Bun.file,
			defaultOption: Bun.file('config/config.json'),
			description: 'Specify config path',
		},

		{
			name: 'sweetness',
			type: Number,
			defaultOption: 3,
			description:
				'Specify the decorations of messages (such as color or emojis)\n' +
				'   0 = no color nor emojis or fancy terminal animations like progress bars\n' +
				'   1 = same as 0 but with colors (16 color range, ANSI)\n' +
				'   2 = 256 color range (maybe) and decorations (like underlines or bolding)\n' +
				'   3 = allows fancy terminal animations like progress bars',
		},
	])

export function printHelp(error = false) {
	let result = ''
	result += 'usage: bun start [options]\n\n'
	result += 'options:\n'

	const commands = []
	for (const option of optionDefinitions) {
		const flags = []
		if (option.alias) flags.push(`-${option.alias}`)
		if (option.name) flags.push(`--${option.name}`)

		let optionLine = flags.join(', ')
		if (
			option.type !== Boolean &&
			option.type &&
			typeof option.type === 'function' &&
			'name' in option.type
		)
			optionLine += `  [${
				('name' in option.type ? option.type.name : '') +
				(option.defaultOption ? `=${format.value(option.defaultOption)}` : '')
			}]`
		commands.push([optionLine, option.description])
	}

	const longestLine = commands
		.map((e) => e[0])
		.reduce((a, b) => (a.length > b.length ? a : b)).length
	const descriptionStart = longestLine + helpSeparation

	result += commands
		.map((command) => {
			const separator = ' '.repeat(descriptionStart - command[0].length)
			return `  ${command[0]}${separator}${command[1].replace(
				/\n/g,
				`\n${' '.repeat(descriptionStart + helpSeparation)}`,
			)}`
		})
		.join('\n')

	log(error ? 'error' : 'reset', result)
}

export default async function parse(version: string) {
	try {
		const parsedOptions: optionsResultInterface =
			commandLineArgs(optionDefinitions)

		// for loop is to give preference to first options
		for (const option in parsedOptions) {
			if (option === 'help') {
				printHelp()
				process.exit(0)
			} else if (option === 'version') {
				// biome-ignore lint/suspicious/noConsoleLog:
				console.log(version)
				process.exit(0)
			}
		}

		// inject option defaults if unset
		for (const { name, defaultOption } of optionDefinitions)
			if (!(name in parsedOptions))
				parsedOptions[name] =
					defaultOption as optionsResultInterface[keyof optionsResultInterface]

		// ensure some stuff is correct before proceeding
		if (!(await parsedOptions.config.exists())) {
			log('error', "file % doesn't exist", [parsedOptions.config.name])
			process.exit(1)
		}

		return parsedOptions
	} catch (err: unknown) {
		if (err instanceof Error && 'optionName' in err)
			log('error', 'error parsing arguments: % (%)\n', [
				err.name,
				err.optionName,
			])
		else log('error', 'error processing arguments %\n', [err])
		printHelp(true)
		process.exit(1)
	}
}
