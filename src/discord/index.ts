import { REST } from '@discordjs/rest'
import { Client, IntentsBitField, Partials, Routes } from 'discord.js'

import type { PrismaClient } from '@prisma/client/extension'

import type interfaces from '#interfaces'
import { log } from '#lib/logger/index.js'

import __old from './_old'

export default async function (
	db: PrismaClient,
	_storage: interfaces.storage,
	config: interfaces.config,
) {
	// import.meta.resolve('#src/discord/test.png')
	const TOKEN = config.discord.token
	const GUILD_ID = config.discord.id.guild
	const BOT_ID = config.discord.id.bot

	const BOT = new Client({
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.GuildMessageReactions,
			IntentsBitField.Flags.GuildIntegrations,
			IntentsBitField.Flags.DirectMessages,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.MessageContent,
		],
		partials: [
			Partials.Message,
			Partials.Channel,
			Partials.GuildMember,
			Partials.User,
			Partials.ThreadMember,
		],
	})

	const COMMANDS = await __old(BOT, db, _storage, config)

	const REST_API = new REST({ version: '10' }).setToken(TOKEN)

	const data = await REST_API.put(
		Routes.applicationGuildCommands(BOT_ID, GUILD_ID),
		{ body: COMMANDS },
	).catch((err) => log('error', 'error registering commands %', [err]))
	// on error it returns number code, success returns registered commands array
	if (Array.isArray(data))
		log('success', 'register application commands (%)', [data.length])

	await BOT.login(TOKEN).catch((err) =>
		log('error', 'bot login error: %', [err]),
	)
}
