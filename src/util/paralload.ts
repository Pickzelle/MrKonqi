import { $ } from 'bun'
import fs from 'node:fs'
import path from 'node:path'

let parapath = 'paralload'

const tmpdir = Bun.env.TMPDIR || '/tmp'
export async function workers(url: string, workers: number): Promise<[Buffer, string | null]> {
	const rnd = Math.random().toString(36).slice(2)
	const out = path.join(tmpdir, `paralload-${rnd}`)

	// when pralload supports `-ouptut -`, use proc.stdout instead
	const proc =
		await $`${parapath} -url ${url} -workers ${workers} -output ${out}`
			.nothrow()
			.quiet()

	const buf = fs.readFileSync(out)
	fs.unlinkSync(out)

	if (proc.exitCode !== 0) return [buf, proc.stderr.toString()]
	return [buf, null]
}

export function setParapath(path: string) {
	parapath = path
}
