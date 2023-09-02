const downloadPackages = require('./download.js');
const convertPackages = require('./convert.js');

/**
 * @async
 * @returns {Promise<string>} A promise that resolves with a success message if everything completed successfully.
 * @throws {Error} If there's any unexpected error during the process.
 */
async function main() {
	const alreadyFetched = await downloadPackages().catch(err => {
		throw new Error('Error downloading packages: ' + err);
	});

	if (!alreadyFetched) {
		// Convert packages just if they haven't been fetched recently
		await convertPackages().catch(err => {
			throw new Error('Error converting packages ' + err);
		});
	}
}

module.exports = main;
