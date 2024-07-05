import fs from 'node:fs'
import path from 'node:path'

import { log } from '#lib/logger'

export function mkdirp(dir: string) {
	if (fs.existsSync(dir)) {
		if (!fs.statSync(dir).isDirectory()) {
			log('error', '% is not a directory', [dir])
			throw new Error(`'${dir}' is not a directory`)
		}
		log('irrelevant', 'checked that % is a directory', [dir], false)
	} else {
		fs.mkdirSync(dir, { recursive: true })
		log('irrelevant', 'made % directory', [dir], false)
	}
}

export function mkflep(filepath: string) {
	if (fs.existsSync(filepath)) {
		if (!fs.statSync(filepath).isFile()) {
			log('error', '% is not a file', [filepath])
			throw new Error(`'${filepath}' is not a file`)
		}
		log('irrelevant', 'checked that % is a file', [filepath], false)
	} else {
		const dirname = path.dirname(filepath)
		mkdirp(dirname)
		touch(filepath)
		log('irrelevant', 'made % file', [filepath], false)
	}
}

export function touch(filepath: string) {
	fs.closeSync(fs.openSync(filepath, 'w'))
}
