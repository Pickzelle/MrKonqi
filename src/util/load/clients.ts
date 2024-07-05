import { PrismaClient } from '@prisma/client'

import { log } from '#lib/logger'

export { default as discord } from '#src/discord'

export function prisma(): PrismaClient {
	try {
		return new PrismaClient()
	} catch (err) {
		if (
			err instanceof Error &&
			err.message.includes('did not initialize yet')
		) {
			log('error', 'please initialize prisma client with %', [
				'bun run gen:prisma',
			])
			process.exit(1)
		} else throw err
	}
}
