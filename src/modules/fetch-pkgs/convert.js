const { createReadStream } = require('fs');
const { readdir, writeFile } = require('fs/promises');
const PATH = require('path');
const ZLIB = require('zlib');
const OS = require('os');
const { green } = require('chalk');

/**
 * This file is a "hacky" way to extract the file contents from the archives quickly.
 * Instead of extracting all archives, we extract the top one (gzip) and remove the null bytes.
 * We then push those values into a JSON file so we can access the data more conveniently.
 */

/**
 * Parses the file content to extract package data.
 *
 * @param {Array} fileContent - The content of the file to be parsed.
 * @returns {Object} An object containing extracted package data.
 */
function parsePackages(fileContent) {
	const packages = {};
	let currentPkgName = '';
	let currentKey = '';

	const lines = fileContent.split('\n');

	for (const line of lines) {
		const trimmedLine = line.trim().replace(/\0/g, '');

		// Check for key declarations enclosed in '%' symbols
		if (trimmedLine.startsWith('%') && trimmedLine.endsWith('%')) {
			currentKey = trimmedLine.slice(1, -1);
		}
		else if (currentKey && trimmedLine) {
			if (currentKey === 'NAME') {
				currentPkgName = trimmedLine;
				packages[currentPkgName] = {};
			}
			else {
				const isExcludedLine = trimmedLine.includes('.zst') || trimmedLine.includes('000755');

				if (!isExcludedLine) {
					// If the values can be multiple, we need to store them in arrays.
					if (['MAKEDEPENDS', 'CHECKDEPENDS', 'DEPENDS', 'OPTDEPENDS', 'PROVIDES', 'REPLACES', 'CONFLICTS'].includes(currentKey)) {
						packages[currentPkgName][currentKey] = packages[currentPkgName][currentKey] || [];
						packages[currentPkgName][currentKey].push(trimmedLine.split(':')[0].trim());
					}
					else {
						packages[currentPkgName][currentKey] = trimmedLine;
					}
				}
			}
		}
	}

	return packages;
}

/**
 * Extracts a gzip file.
 *
 * @async
 * @param {PATH} gzipFile - The file path for the gzip file.
 * @returns {Promise} The file contents of the archive or an error.
 */
async function extractGzip(gzipFile) {
	return new Promise((resolve, reject) => {
		const inputStream = createReadStream(gzipFile);
		const chunks = [];

		inputStream
			.pipe(ZLIB.createGunzip())
			.on('data', chunk => chunks.push(chunk))
			.on('end', () => {
				const fileContent = Buffer.concat(chunks).toString('utf8');
				resolve(fileContent);
			})
			.on('error', error => reject(error));
	});
}

/**
 * Processes Gzip files by extracting their content, parsing packages, and converting to JSON.
 * Extracted JSON files are stored in the specified directory.
 *
 * @async
 * @function processGzipFiles
 * @throws {Error} If there's an error during processing.
 */
async function processGzipFiles() {
	try {
		const dbDir = PATH.join(__dirname, '../../stored');

		const files = await readdir(PATH.join(OS.tmpdir(), 'MrKonqi'));
		const gzipFiles = files.filter(file => PATH.extname(file) === '.db');

		await Promise.all(
			gzipFiles.map(async gzipFile => {
				try {
					const fileContent = await extractGzip(PATH.join(OS.tmpdir(), 'MrKonqi', gzipFile));
					const packages = parsePackages(fileContent);

					const jsonFilename = gzipFile.replace('.db', '.json');
					await writeFile(PATH.join(dbDir, jsonFilename), JSON.stringify(packages, null, 4));

					console.log(green(`[Convert] - Processed ${gzipFile} successfully.`));
				}
				catch (error) {
					console.error(`Error processing ${gzipFile}: ${error.message}`);
				}
			}),
		);
	}
	catch (error) {
		console.error(`Error reading module directory: ${error.message}`);
	}
}

module.exports = processGzipFiles;
