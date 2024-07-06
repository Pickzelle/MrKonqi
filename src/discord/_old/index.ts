import fs from 'node:fs'
import path from 'node:path'

import {
	type Client,
	Collection,
	type SlashCommandOptionsOnlyBuilder,
} from 'discord.js'

import type { PrismaClient } from '@prisma/client/extension'

import type interfaces from '#interfaces'
import { task } from '#lib/logger/index.js'
import getDB from '#src/discord/_old/legacy-db.js'

interface extBOT extends Client<boolean> {
	commands: Collection<string, unknown>
	buttons: Collection<string, unknown>
	modals: Collection<string, unknown>
}

interface commandFile {
	data: SlashCommandOptionsOnlyBuilder
}

export default async function (
	lBOT: Client<boolean>,
	_db: PrismaClient,
	_storage: interfaces.storage,
	config: interfaces.config,
) {
	const BOT = lBOT as extBOT
	const DB = getDB()

	BOT.commands = new Collection()
	BOT.buttons = new Collection()
	BOT.modals = new Collection()
	const COMMANDS: object[] = []

	const isImportable = (file: string) => /\.(?:js|ts|cjs|mjs)$/i.test(file)
	const EVENT_FILES = fs
		.readdirSync(path.join(import.meta.dir, 'events'))
		.filter(isImportable)
	const COMMAND_FILES = fs
		.readdirSync(path.join(import.meta.dir, 'commands'))
		.filter(isImportable)
	const BUTTON_FILES = fs
		.readdirSync(path.join(import.meta.dir, 'buttons'))
		.filter(isImportable)
	const MODAL_FILES = fs
		.readdirSync(path.join(import.meta.dir, 'modals'))
		.filter(isImportable)

	if (!fs.existsSync(path.join(import.meta.dir, 'stored'))) {
		fs.mkdirSync(path.join(import.meta.dir, 'stored'))
	}

	for (const FILE of EVENT_FILES) {
		const event = await import(path.join(import.meta.dir, 'events', FILE))
		if (event.once) {
			BOT.once(event.name, (...args) => event.execute(BOT, DB, config, ...args))
		} else {
			BOT.on(event.name, (...args) => event.execute(BOT, DB, config, ...args))
		}
	}

	// Loop through command files and register commands
	for (const FILE of COMMAND_FILES) {
		const cmdTask = task('[cmd] importing %', [FILE])
		const command: commandFile = await import(
			path.join(import.meta.dir, 'commands', FILE)
		)

		cmdTask[command.data === undefined ? 'fail' : 'complete'](
			'[cmd] import %',
			[FILE],
		)
		if (command.data === undefined) continue

		COMMANDS.push(command.data.toJSON())
		BOT.commands.set(command.data.name, command)
	}

	// Loop through button files and register buttons
	for (const FILE of BUTTON_FILES) {
		const btnTask = task('[btn] importing %', [FILE])
		const button = await import(path.join(import.meta.dir, 'buttons', FILE))

		btnTask[button.name === undefined ? 'fail' : 'complete']('[btn] import %', [
			FILE,
		])
		if (button.name === undefined) continue

		BOT.buttons.set(button.name, button)
	}

	// Loop through modal files and register modals
	for (const FILE of MODAL_FILES) {
		const mdlTask = task('[mdl] importing %', [FILE])
		const modal = await import(path.join(import.meta.dir, 'modals', FILE))

		mdlTask[modal.name === undefined ? 'fail' : 'complete']('[mdl] import %', [
			FILE,
		])
		if (modal.name === undefined) continue

		BOT.modals.set(modal.name, modal)
	}

	return COMMANDS
}
