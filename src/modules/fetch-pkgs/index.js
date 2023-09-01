const downloadPackages = require('./download.js');
const convertPackages = require('./convert.js');

/**
 * @async
 * @returns {Promise<string>} A promise that resolves with a success message if everything completed successfully.
 * @throws {Error} If there's any unexpected error during the process.
 */
async function main() {
	return new Promise(async (resolve, reject) => {
		let alreadyFetched = await downloadPackages().catch(err => {
			reject(new Error('Error downloading packages: ' + err));
		});

		if(!alreadyFetched) {
			// Convert packages just if they haven't been fetched recently
			await convertPackages().catch(err => {
				reject(new Error('Error converting packages ' + err))
			});
		}
		resolve();
	});
}

module.exports = main;
