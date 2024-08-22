import type { PrismaClient } from '@prisma/client/extension'
import type { Client, Interaction, SlashCommandOptionsOnlyBuilder } from 'discord.js'

import type interfaces from '#interfaces'

type callback = (
	BOT: Client<boolean>,
	DB: PrismaClient,
	STORGE: interfaces.storage,
	CONFIG: interfaces.config,
	interaction: Interaction
) => Promise<void>

export default interface commandExport {
	data: SlashCommandOptionsOnlyBuilder
	execute: callback
}
