/**
 * Discord Bot Gpg Command
 * @module arch
 */
const {
	SlashCommandBuilder,
	EmbedBuilder,
	ModalBuilder, ActionRowBuilder,
	TextInputBuilder, TextInputStyle,
	StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
	ComponentType,
} = require('discord.js');
const axios = require('axios').default;
const openpgp = require('openpgp');
const gpg = require('#modules/gpg.js');

async function askForSignature(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('verify-gpg')
		.setTitle('Verify Identity');

	const signatureInput = new TextInputBuilder()
		.setCustomId('signature')
		.setLabel(`Clearsign: 'YES, I'M ${interaction.user.id.substring(0, 5)}'`)
		.setStyle(TextInputStyle.Paragraph);

	const actionRow = new ActionRowBuilder().addComponents(signatureInput);

	modal.addComponents(actionRow);
	await interaction.showModal(modal);
	const modalSubmit = await interaction.awaitModalSubmit({
		// 15 minutes
		time: 15 * 60 * 1000,
		filter: i => i.user.id === interaction.user.id,
	}).catch(error => {
		console.error(error);
		return null;
	});
	if (modalSubmit) return modalSubmit;
}

async function askForSignatureAndVerify(interaction, key) {
	// Ask for signature
	const modalResponse = await askForSignature(interaction);
	if (!modalResponse) return;

	// Fetch key data
	const keyData = (
		await axios.get(key.dwUrl || key, { timeout: 2500 })
			.catch(err =>
				modalResponse.reply('Something went wrong fetching key: ' + err),
			)
	)?.data;
	if (!keyData) return {};

	// Parse key data
	const publicKey = await openpgp.readKey({ armoredKey: keyData })
		.catch(err =>
			modalResponse.reply('Something went wrong parsing key: ' + err),
		);
	if (!publicKey) return {};

	// Get and parse signature
	const signature = modalResponse.fields.fields
		.find(response => response.customId === 'signature').value;
	const signedMessage =
		await openpgp.readCleartextMessage({ cleartextMessage: signature })
			.catch(err =>
				modalResponse.reply('Error parsing clearsigned message: ' + err),
			);
	if (!signedMessage) return {};

	// Verify signature
	const verificationResult = await openpgp.verify({
		message: signedMessage,
		verificationKeys: publicKey,
	});
	const signatureResult = verificationResult.signatures[0];

	try {
		// Fails if invalid signature
		await signatureResult.verified;

		// Verify content
		const expectedSentence = 'YES, I\'M ' + modalResponse.user.id.substring(0, 5);
		if (signedMessage.text !== expectedSentence) {
			modalResponse.reply('Signed message doesn\'t say "' + expectedSentence + '"');
			return {};
		}

		// Made in the last 5 mins
		const signDate = signedMessage.signature.packets[0].created;
		if (Date.now() - signDate > 5 * 60 * 1000) {
			modalResponse.reply('Signed more than 5 minutes ago, please clearsign again');
			return {};
		}
	}
	catch {
		modalResponse.reply('Couldn\'t verify signature');
		return {};
	}

	return {
		signInteraction: modalResponse,
		keyData: publicKey,
		keyID: Buffer.from(publicKey.keyPacket.fingerprint)
			.toString('hex').toUpperCase(),
	};
}

function multipleKeysChoice(keys, id) {
	function formatKeyToField(key, i) {
		return {
			name: `${i}. **${key.keyid}**\n<t:${key.date.getTime() / 1000}>`,
			value: `[download](${key.dwUrl})\n` +
				key.uids.map(([identity, date]) =>
					`${identity} <t:${date.getTime() / 1000}>`,
				).join('\n'),
			inline: false,
		};
	}
	function formatKeyToMenuOption(key, i) {
		return new StringSelectMenuOptionBuilder()
			.setLabel(`${i}. ${key.keyid}`)
			.setDescription(`<t:${key.date.getTime() / 1000}>`)
			.setValue(key.dwUrl);
	}

	const select = new StringSelectMenuBuilder()
		.setCustomId(id)
		.setPlaceholder('Choose a key!')
		.addOptions(...keys.map(formatKeyToMenuOption));

	const row = new ActionRowBuilder()
		.addComponents(select);

	const embed = new EmbedBuilder()
		.setTitle('Select GPG key')
		.setFields(...keys.map(formatKeyToField));


	if (embed.length > 6000) return 'Found too many results, try a more specific query';
	return { embeds: [embed], components: [row] };
}

function importKeyEmbed(importPromise, interaction) {
	importPromise.then(({ keyID, user }) => {
		interaction.reply('Sucessfully imported key ' + keyID + ' to <@' + user.id + '>');
	}).catch(err => {
		interaction.reply('Oops! something went wrong: ' + err);
	});
}

/* eslint-disable no-irregular-whitespace */
// gpg
// └── import
//     ├── query
//     │   └── string (required)
//     └── file
//         └── attachment (required)
/* eslint-enable no-irregular-whitespace */

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gpg')
		.setDescription('Allows you to link your gpg key to your discord account or verify messages')
		.setDescriptionLocalizations({
			'es-ES': 'Permite enlazar tu clave gpg a tu cuenta de discord o verificar mensajes',
			'sv-SE': 'Tillåter dig att länka din gpg nyckel till ditt discord konto eller verifiera meddelanden',
		})
		.addSubcommand(subCommandGroup => subCommandGroup
			.setName('import')
			.setNameLocalizations({
				'es-ES': 'importar',
				'sv-SE': 'importera',
			})
			.setDescription('Imports a gpg key')
			.setDescriptionLocalizations({
				'es-ES': 'Importa una clave gpg',
				'sv-SE': 'Importerar en gpg nyckel',
			})
			.addStringOption(keyID => keyID
				.setName('query')
				.setDescription('Query to look for on keyservers')
				.setDescriptionLocalizations({
					'es-ES': 'Busqueda que haver en los servidores de claves',
					'sv-SE': 'Sökfråga att leta efter på nyckel-servrarna',
				}),
			)
			.addAttachmentOption(file => file
				.setName('file')
				.setNameLocalizations({
					'es-ES': 'archivo',
					'sv-SE': 'fil',
				})
				.setDescription('Public key')
				.setDescriptionLocalizations({
					'es-ES': 'Clave pública',
					'sv-SE': 'Publik nyckel',
				}),
			),
		),

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Interaction} interaction - A Discord interaction
	*/
	async execute(BOT, DB, interaction) {
		const gpgLib = gpg(BOT, DB);

		function importKey(keyData, keyID) {
			return gpgLib.importKeyToUser(keyData, keyID, interaction.user);
		}

		switch (interaction.options._subcommand) {
			case 'import': {
				// Query key on keyservers
				const query = interaction.options._hoistedOptions
					.find(option => option.name === 'query')?.value;
				const attachment = interaction.options._hoistedOptions
					.find(option => option.name === 'file')?.attachment?.url;

				// Import from attached file
				if (attachment) {
					const { signInteraction, keyData, keyID } =
						await askForSignatureAndVerify(interaction, attachment);
					if (!signInteraction) return;

					importKeyEmbed(
						importKey(keyData, keyID),
						signInteraction,
					);
				}
				else if (query) {

					// Query keyservers for keys
					const results = await gpgLib.searchKeyservers(query)
						.catch(err => interaction.reply(String(err)));
					if (!results?.length) return;

					// No keys found
					if (results.length == 0) {
						interaction.reply('Couldn\'t find any result for the query');
					}
					// One key found
					else if (results.length == 1) {
						const { signInteraction, keyData, keyID } =
							await askForSignatureAndVerify(interaction, results[0]);
						if (!signInteraction) return;

						importKeyEmbed(
							importKey(keyData, keyID),
							signInteraction,
						);
					}
					// Multiple keys found
					else if (results.length <= 25) {
						const replyToSend = multipleKeysChoice(results, interaction.id);
						const reply = await interaction.reply(replyToSend);
						if (typeof replyToSend === 'string') return;

						const collector = reply.createMessageComponentCollector({
							componentType: ComponentType.StringSelect,
							filter: i => i.user.id === interaction.user.id && i.customId === interaction.id,
							// 1min
							time: 60 * 1000,
						});

						collector.on('collect', async chosedInteraction => {
							const keyToImport = results.find(key => key.dwUrl === chosedInteraction.values[0]);

							const { signInteraction, keyData, keyID } =
								await askForSignatureAndVerify(chosedInteraction, keyToImport);
							if (!signInteraction) return;

							importKeyEmbed(
								importKey(keyData, keyID),
								signInteraction,
							);
						});
					}
					// Way too many keys found
					else {
						interaction.reply('Too many entries, try a more specific query.');
					}
				}
				else {
					interaction.reply('Please, put a query or attach a key file');
				}
				break;
			}
		}
	},
};
