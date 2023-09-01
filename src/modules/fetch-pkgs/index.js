const downloadPackages = require('./download.js');
const convertPackages = require('./convert.js');

/**
 * Runs a series of processes sequentially using Node.js `spawn`.
 * This function first spawns a download process, and if successful,
 * it spawns a conversion process. The console output of the processes
 * is shared with the parent process.
 *
 * @async
 * @returns {Promise<string>} A promise that resolves with a success message if all processes complete successfully.
 * @throws {Error} If there's an error during process spawning or if any of the processes fail.
 */
async function main() {
	return new Promise(async (resolve, reject) => {
		let alreadyFetched = await downloadPackages().catch(err => {
			reject(new Error('Error downloading packages: ' + err));
		});

		if(!alreadyFetched) {
			// Spawn the second process if the first one succeeded
			await convertPackages().catch(err => {
				reject(new Error('Error converting packages ' + err))
			});
		}
		resolve();
	});
}

module.exports = main;
