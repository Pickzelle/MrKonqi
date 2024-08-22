import type { Client, ClientEvents } from 'discord.js'
import type { PrismaClient } from '@prisma/client'

import type interfaces from '#interfaces'
import type commandExport from '#src/discord/commands/schema.js'

type callback<K> = (
	BOT: Client<boolean>,
	DB: PrismaClient,
	STORGE: interfaces.storage,
	CONFIG: interfaces.config,
	COMMANDS: commandExport[],
	...args: K
) => Promise<void>

export default interface eventExport<K = keyof ClientEvents> {
	name: K
	on?: callback<ClientEvents[K]>
	once?: callback<ClientEvents[K]>
}
