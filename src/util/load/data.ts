import fs from 'node:fs'
import { log } from '#lib/logger/index.js'

// single small object for storage
const PATH = 'data/storage.json'
export function syncedStorage<T extends object>(): T {
	let storage: T = {} as T

	if (fs.existsSync(PATH))
		storage = JSON.parse(fs.readFileSync(PATH).toString())

	const handler = {
		// ik, weird types
		set(obj: T, prop: keyof object, value: never) {
			log('info', '[storage] setting property % to %', [prop, value], false)

			obj[prop] = value
			fs.writeFileSync(PATH, JSON.stringify(obj, null, '\t'))
			return true
		},
	}

	return new Proxy(storage, handler)
}
