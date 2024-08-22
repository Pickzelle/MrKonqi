import { REST } from '@discordjs/rest'
import { Client, IntentsBitField, Partials, Routes } from 'discord.js'

import type { PrismaClient } from '@prisma/client/extension'

import type interfaces from '#interfaces'
import { log } from '#lib/logger/index.js'

import * as events from './events'
import * as commands from './commands'
import __old from './_old'
import type commandExport from '#src/discord/commands/schema.js'

export default async function (
	DB: PrismaClient,
	STORAGE: interfaces.storage,
	CONFIG: interfaces.config,
) {
	// import.meta.resolve('#src/discord/test.png')
	const TOKEN = CONFIG.discord.token
	const GUILD_ID = CONFIG.discord.id.guild
	const BOT_ID = CONFIG.discord.id.bot

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

	// TODO: this initialization should eventually convert to an empty array
	const COMMANDS = (await __old(BOT, DB, STORAGE, CONFIG)).map(
		// dummy old command execute as we don't want them to run with the new events
		(k) => ({
			data: k,
			execute(_a, _b, _c, _d, _e) {
				log('iwarn', 'old function was called')
			},
		}),
	) as commandExport[]
	for (const commandKey in commands) {
		const command = commands[commandKey as keyof typeof commands].default
		COMMANDS.push(command)
	}

	for (const eventKey in events) {
		const event = events[eventKey as keyof typeof events].default
		const { on, once } = event
		if (once)
			BOT.on(event.name, (...args) => {
				once(BOT, DB, STORAGE, CONFIG, COMMANDS, ...args)
			})
		if (on)
			BOT.on(event.name, (...args) => {
				on(BOT, DB, STORAGE, CONFIG, COMMANDS, ...args)
			})
	}

	const REST_API = new REST({ version: '10' }).setToken(TOKEN)

	const data = await REST_API.put(
		Routes.applicationGuildCommands(BOT_ID, GUILD_ID),
		{ body: COMMANDS.map((cmd) => cmd.data) },
	).catch((err) => log('error', 'error registering commands %', [err]))
	// on error it returns number code, success returns registered commands array
	if (Array.isArray(data))
		log('success', 'register application commands (%)', [data.length])

	await BOT.login(TOKEN).catch((err) =>
		log('error', 'bot login error: %', [err]),
	)
}
