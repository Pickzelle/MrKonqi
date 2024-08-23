import { $ } from 'bun'
import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js'
import z from 'zod'

import { log } from '#lib/logger'
import { DISCORD_MAX_UPLOAD } from '#util/constants'
import * as paralload from '#util/paralload'
import type schema from './schema'

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

		const json = await getVidJson(query)
		const fmts = jsonGetFmts(json)
		const fmt = findFmt(fmts, oa, DISCORD_MAX_UPLOAD)
		if (!fmt) {
			return interaction.editReply('error finding video')
		}

		log(
			'info',
			'[interaction/cmd/yt-dlp] query % (audioonly %): %',
			[query, oa, fmt.url],
			false,
		)

		interaction.editReply('starting download...')

		const [buf, err] = await paralload.workers(fmt.url, 2)
		if (buf.length === 0 || err !== null) {
			log('error', '[interaction/cmd/yt-dlp] download failed. %', [err])
			return interaction.editReply('command error')
		}

		const fext = fmt.ext ? `.${fmt.ext}` : ''

		const fname = interaction.id + fext

		interaction.editReply('uploading result...')
		const file = new AttachmentBuilder(buf, {
			name: fname,
		})

		await interaction.editReply({
			content: query,
			files: [file],
		})
	},
} as schema

async function getVidJson(query: string) {
	try {
		return await $`yt-dlp -j ${query}`.json()
	} catch (_err) {
		return {}
	}
}

function jsonGetFmts(json: object) {
	if ('formats' in json && Array.isArray(json.formats)) {
		return json.formats
	}
	return []
}

const fmtEntry = z
	.object({
		url: z.string(),
		format_id: z.string(),
		audio_channels: z.number(),
		ext: z.string(),
		filesize: z.number(),
		quality: z.number(),
		fps: z.number().or(z.null()),
	})
	.required()
type FmtEntry = z.infer<typeof fmtEntry>
function findFmt(fmts: unknown[], oa: boolean, maxSize: number) {
	let arr: FmtEntry[] = []
	for (const e of fmts) {
		try {
			arr.push(fmtEntry.parse(e))
		} catch (_err) {}
	}

	arr = arr
		.filter((e) => e.filesize <= maxSize)
		.filter((e) => (oa ? !e.fps : true))
		.sort((a, b) => extSort(b.ext, a.ext) || b.quality - a.quality)

	return arr[0]
}

// I dont like this code the slightest tho
// 1 if basically it makes discord embeds
const extPoints: { [key: string]: number } = {
	m4a: 1,
	mp4: 1,
	opus: 0,
	webm: 0,
}
function extSort(extA: string, extB: string) {
	const pA = extPoints[extA] || 0
	const pB = extPoints[extB] || 0
	return pA - pB
}
