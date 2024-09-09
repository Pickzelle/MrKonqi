const downloadPackages = require('./download')
const convertPackages = require('./convert')

/**
 * @async
 * @returns {Promise<string>} A promise that resolves with a success message if everything completed successfully.
 * @throws {Error} If there's any unexpected error during the process.
 */
async function main() {
	// biome-ignore lint:
	return new Promise(async (resolve, reject) => {
		const alreadyFetched = await downloadPackages()
		if (!alreadyFetched) {
			// Convert packages just if they haven't been fetched recently
			await convertPackages().catch((err) => {
				reject(new Error(`Error converting packages ${err}`))
			})
		}
		resolve()
	})
}

module.exports = main
