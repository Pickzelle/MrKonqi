const axios = require('axios')
const os = require('node:os')
const path = require('node:path')
const { createWriteStream } = require('node:fs')

async function download(url) {
	return new Promise((resolve) => {
		try {
			axios.get(url, { responseType: 'stream' }).then((response) => {
				const fileStream = response.data

				const filePath = path.join(
					os.tmpdir(),
					'MrKonqi',
					`${Math.floor(Math.random() * (10000 - 1)) + 1}.asc`,
				)
				const writeStream = createWriteStream(filePath)

				fileStream.pipe(writeStream)

				writeStream.on('finish', () => {
					resolve(filePath)
				})

				writeStream.on('error', (err) => {
					// biome-ignore lint:
					console.log(err)
				})
			})
		} catch (e) {
			// biome-ignore lint:
			console.log(e)
		}
	})
}

module.exports = download
