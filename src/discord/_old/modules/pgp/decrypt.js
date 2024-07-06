const OpenPGP = require('openpgp')
const { readFile } = require('node:fs/promises')

/**
 * Decrypts an OpenPGP encrypted message using the provided passphrase.
 *
 * @param {Object} args - The arguments for decryption.
 * @param {string} [args.tmpFile] - The path to the temporary file containing the encrypted data.
 * @param {string|null} [args.passphrase] - The passphrase used for decryption. Can be null if not provided.
 * @param {string} [args.message] - The OpenPGP armored message to decrypt.
 * @returns {Promise<string>} A Promise that resolves with the decrypted data as a string.
 * @throws {Error} If decryption fails for any reason.
 */
async function decrypt(args) {
	try {
		if (!args.tmpFile && !args.message) {
			throw new Error('Either args.tmpFile or args.message must be provided.')
		}

		const encryptedData = args.message
			? args.message
			: await readFile(args.tmpFile, 'ascii')

		const message = await OpenPGP.readMessage({ armoredMessage: encryptedData })

		const { data } = await OpenPGP.decrypt({
			message,
			format: 'binary',
			passwords: args.passphrase ? args.passphrase : 'TuxCord',
		})

		if (!data) throw 'I was unable to decode the data.'

		return new TextDecoder().decode(data)
	} catch (error) {
		throw `Error decrypting message: ${error.message}`
	}
}

module.exports = decrypt
