import { $ } from 'bun'
import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js'

import type schema from './schema'
import { log } from '#lib/logger/index.ts'

const maxs = 8 * 1024 ** 2 // TODO
const mimetypes: Map<string, string[]> = new Map()
try {
	for await (const line of $`cat /etc/mime.types | grep -v '^#'`.lines()) {
		const parts = line.split(/\s+/g)
		const type = parts.shift()
		if (!type) continue
		mimetypes.set(type, parts)
	}
} catch (err) {
	log('error', 'err parsing /etc/mime.types: %', [err])
}

export default {
	data: new SlashCommandBuilder()
		.setName('yt-dlp')
		.setDescription('Download video using yt-dlp')
		.addStringOption((option) =>
			option
				.setName('query')
				.setDescription('download argument')
				.setRequired(true),
		)
		.addBooleanOption((option) =>
			option
				.setName('onlyaudio')
				.setDescription('Whether or not to download only audio')
				.setRequired(false),
		),

	async execute(_BOT, _DB, _STORE, _CONFIG, interaction) {
		await interaction.deferReply()
		const query = (interaction.options.getString('query') ?? '').trim()
		const oa = interaction.options.getBoolean('onlyaudio') ?? false

		if (query.startsWith('-'))
			return interaction.editReply("query can't start with `-`")

		const proc =
			await $`yt-dlp -o - --max-filesize ${maxs} --prefer-free-formats ${oa ? '-x' : ''} ${query}`
				.nothrow()
				.quiet()
		if (proc.exitCode !== 0)
			return interaction.editReply(
				`### Error\n\`\`\`\n${proc.stderr.toString()}\`\`\``,
			)

		const mimetype = (await magicGet(proc.stdout)).split(';')[0]
		const ext = mimetypes.get(mimetype)?.[0] || ''
		const fext = ext ? `.${ext}` : ''

		const fname = interaction.id + fext

		const file = new AttachmentBuilder(proc.stdout, {
			name: fname,
		})

		await interaction.editReply({
			content: query,
			files: [file],
		})
	},
} as schema

async function magicGet(file: Buffer) {
	try {
		return $`file -ib - < ${file}`.text()
	} catch (_err) {
		return ''
	}
}
