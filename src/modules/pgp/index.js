const decryptGPG = require('./decrypt.js');
const download = require('./download.js');
const { unlink } = require('node:fs/promises');
const { green, red } = require('chalk');

/**
 * Main function to perform PGP (Pretty Good Privacy) operations.
 *
 * @param {number} type - The type of operation to perform. Valid types are: decrypt and encrypt.
 * @param {object} args - An object containing the necessary arguments for the operation.
 * @param {import('discord.js').Attachment} args.file - The file to be processed.
 * @param {string} args.message - The plain text PGP message.
 * @returns {Promise<any>} A promise that resolves to the result of the PGP operation.
 * @throws {Error} If the file size is too big or the file has an incorrect suffix.
 */
function main(type, args) {
	return new Promise((resolve, reject) => {
		if (type === 'decrypt') {

			if (args.file) {

				if (args.file.size / 1024 / 1024 > 2) {
					reject('file size is too big');
				}
				else if (!['.txt', '.asc'].some(suffix => args.file.url.endsWith(suffix))) {
					reject('wrong file suffix');
				}
				else {
					download(args.file.url)
						.then(downloadResult => {
							args.tmpFile = downloadResult;
							console.log(green(`[PGP] - Downloaded file to: ${args.tmpFile}`));
							return decryptGPG(args);
						})
						.then(decryptedData => {
							resolve(decryptedData);
						})
						.catch(err => {
							reject(err.toString());
						})
						.finally(() => {
							unlink(args.tmpFile).then(() => {
								console.log(green(`[PGP] - Deleted file at: ${args.tmpFile}`));
							}, e => console.log(red(`[PGP] - ${e}`)));
						});
				}

			}
			else if (args.message) {
				decryptGPG(args)
					.then(decryptedData => {
						resolve(decryptedData);
					})
					.catch(err => {
						reject(err.toString());
					});
			}
			else {
				reject('Wrong instruction type..');
			}
		}
		// FIXME add encrypt option.
		else {
			console.log(`Invalid operation type: ${type}`);
			reject('Invalid operation type');
		}
	});
}

module.exports = main;
