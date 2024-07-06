import path from 'node:path'
import type { BunFile } from 'bun'

import { log } from '#lib/logger'
import { mkdirp } from '#util/fs.js'

import type interfaces from '#interfaces'

export default async function parse(
	configFile: BunFile,
): Promise<{ config: interfaces.config; processed: { logfile: string } }> {
	const config: interfaces.config = await configFile.json().catch((err) => {
		log('error', 'error parsing config file at %:\n%', [configFile, err])
		process.exit(1)
	})

	// Put some defaults
	// ...

	// Preprocess config
	mkdirp(config.dirs.log)
	const logfile = path.join(config.dirs.log, `${Date.now()}.log`)

	return {
		config,
		processed: { logfile },
	}
}
