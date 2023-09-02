const fs = require('fs');
const https = require('https');
const os = require('os');

const path = require('path');
const jsonFilePath = path.join(__dirname, '../../stored/timestamp.json');
const url = 'https://ftp.acc.umu.se/mirror/archlinux/';
const tmpDir = path.join(os.tmpdir(), 'MrKonqi');
const { green } = require('chalk');

const fileData = [
	{
		url: url + 'core/os/x86_64/core.db',
		name: 'core.db',
	},
	{
		url: url + 'core-testing/os/x86_64/core-testing.db',
		name: 'core-testing.db',
	},
	{
		url: url + 'extra/os/x86_64/extra.db',
		name: 'extra.db',
	},
	{
		url: url + 'extra-testing/os/x86_64/extra-testing.db',
		name: 'extra-testing.db',
	},
	{
		url: url + 'kde-unstable/os/x86_64/kde-unstable.db',
		name: 'kde-unstable.db',
	},
	{
		url: url + 'multilib/os/x86_64/multilib.db',
		name: 'multilib.db',
	},
	{
		url: url + 'multilib-testing/os/x86_64/multilib-testing.db',
		name: 'multilib-testing.db',
	},
];

/**
 * Saves a timestamp of the last fetch.
 *
 * @param {number} timestamp - The timestamp to be saved.
 */
function saveLastFetchTimestamp(timestamp) {
	const data = { lastFetchTimestamp: timestamp };
	fs.writeFileSync(jsonFilePath, JSON.stringify(data));
}

/**
 * Retrieves the timestamp of the previous fetch from the stored data.
 *
 * @returns {number} The timestamp of the last fetch.
 */
function loadLastFetchTimestamp() {
	try {
		const data = fs.readFileSync(jsonFilePath);
		return JSON.parse(data).lastFetchTimestamp || 0;
	}
	catch (error) {
		return 0;
	}
}

/**
 * Downloads files from URLs specified in the `fileData` array, considering the last fetch timestamp.
 *
 * @returns {boolean} If files haven't been fetched recently
 * @async
 */
function downloadFileFromURL() {
	return new Promise((resolve, reject) => {
		const lastFetchTimestamp = loadLastFetchTimestamp();
		const currentTimestamp = Date.now();
		const threeHoursInMilliseconds = 3 * 60 * 60 * 1000;

		if (currentTimestamp - lastFetchTimestamp >= threeHoursInMilliseconds) {
			const downloadPromises = fileData.map((file) => {
				return new Promise((resolve, reject) => {

					if (!fs.existsSync(tmpDir)) {
						fs.mkdirSync(tmpDir, { recursive: true });
					}

					const fileStream = fs.createWriteStream(path.join(tmpDir, file.name));

					https.get(file.url, (response) => {
						if (response.statusCode !== 200) {
							// Failed to download file, store it in the timestamp file.
							const errorTimestamp = Date.now();
							const errorData = {
								url: file.url,
								statusCode: response.statusCode,
								timestamp: errorTimestamp,
							};
							fs.appendFileSync(jsonFilePath, JSON.stringify(errorData) + '\n');
							reject(`Failed to download file. Status code: ${response.statusCode}`);
							return;
						}

						response.pipe(fileStream);

						fileStream.on('finish', () => {
							console.log(green(`[Download] - File '${file.name}' downloaded successfully!`));
							resolve();
						});

						fileStream.on('error', (err) => {
							console.error('Error writing the file:', err);
							reject(err);
						});
					}).on('error', (err) => {
						console.log('Error downloading the file:', err);
						reject(err);
					});
				});
			});

			Promise.all(downloadPromises)
				.then(() => {
					saveLastFetchTimestamp(currentTimestamp);
					resolve(false);
				})
				.catch(reject);
		}
		else { resolve(true); }
	});
}

module.exports = downloadFileFromURL;
