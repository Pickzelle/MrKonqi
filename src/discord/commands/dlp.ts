import { $ } from 'bun'
import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js'

import { log } from '#lib/logger/index.ts'
import { DISCORD_MAX_UPLOAD } from '#util/constants'
import type schema from './schema'

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
		.setName('dlp')
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
		const ao = interaction.options.getBoolean('onlyaudio') ?? false

		if (query.startsWith('-'))
			return await interaction.editReply("query can't start with `-`")

		log(
			'info',
			'[interaction/cmd/yt-dlp] query % (audioonly %)',
			[query, ao],
			false,
		)

		await interaction.editReply('starting download...')
		const proc =
			await $`yt-dlp -o - --max-filesize ${DISCORD_MAX_UPLOAD} --prefer-free-formats ${ao ? '-x' : ''} ${query}`
				.nothrow()
				.quiet()
		if (proc.exitCode !== 0 || proc.stdout.length === 0) {
			log('error', '[interaction/cmd/yt-dlp] download failed. %', [
				proc.stderr.toString(),
			])
			return await interaction.editReply('command error')
		}

		const mimetype = (await magicGet(proc.stdout)).split(';')[0]
		const ext = mimetypes.get(mimetype)?.[0] || ''
		const fext = ext ? `.${ext}` : ''

		const fname = interaction.id + fext

		await interaction.editReply('uploading result...')
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
