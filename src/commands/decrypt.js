const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const PGP = require('#modules/pgp/index.js');
const { red } = require('chalk');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('decrypt')
		.setNameLocalizations({
			'sv-SE': 'avkryptera',
		})
		.setDescription('Decrypts a PGP file')
		.setDescriptionLocalizations({
			'sv-SE': 'Avkrypterar en PGP fil',
		})
		.addSubcommand(subCommand => subCommand
			.setName('modal')
			.setDescription('Displays the decryption options in a modal instead')
			.setDescriptionLocalizations({
				'sv-SE': 'Visar avkrypteringsalternativen i en modal istället',
			})
			.addBooleanOption(option => option
				.setName('ephemeral')
				.setNameLocalizations({
					'sv-SE': 'efemär',
				})
				.setDescription('Toggles whether or not this message should be ephemeral')
				.setDescriptionLocalizations({
					'sv-SE': 'Växlar om det här meddelandet ska vara kortvarigt eller inte',
				}),
			),
		)
		.addSubcommand(subCommand => subCommand
			.setName('attachment')
			.setNameLocalizations({
				'sv-SE': 'fil',
			})
			.setDescription('Decrypt a PGP file from an attachment')
			.setDescriptionLocalizations({
				'sv-SE': 'Avkryptera en PGP fil genom en bifogad fil',
			})
			.addAttachmentOption(option => option
				.setName('file')
				.setNameLocalizations({
					'sv-SE': 'fil',
				})
				.setDescription('The PGP file you wish to decrypt')
				.setDescriptionLocalizations({
					'sv-SE': 'PGP filen du vill avkryptera',
				})
				.setRequired(true),
			)
			.addStringOption(option => option
				.setName('password')
				.setNameLocalizations({
					'sv-SE': 'lösenord',
				})
				.setDescription('The password if it\'s password protected')
				.setDescriptionLocalizations({
					'sv-SE': 'Lösenordet om det är lösenordsskyddat',
				}),
			)
			.addBooleanOption(option => option
				.setName('ephemeral')
				.setNameLocalizations({
					'sv-SE': 'efemär',
				})
				.setDescription('Toggles whether or not this message should be ephemeral')
				.setDescriptionLocalizations({
					'sv-SE': 'Växlar om det här meddelandet ska vara kortvarigt eller inte',
				}),
			),
		),

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Interaction} Interaction - A Discord interaction
	*/
	async execute(BOT, DATABASE, Interaction) {

		const PASS = Interaction.options.getString('password');
		const FILE = Interaction.options.getAttachment('file');
		const EPHEMERAL = Interaction.options.getBoolean('ephemeral') ?? true;
		const COMMAND = Interaction.options.getSubcommand();

		if (COMMAND === 'modal') {

			const VIEW = new ModalBuilder()
				.setCustomId(`decrypt | ${EPHEMERAL}`)
				.setTitle('PGP Decryption');

			const TEXT = new TextInputBuilder()
				.setCustomId('message')
				.setLabel('PGP Message')
				.setPlaceholder('-----BEGIN PGP MESSAGE-----')
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(true);

			const PASSWORD = new TextInputBuilder()
				.setCustomId('password')
				.setLabel('PGP Password')
				.setPlaceholder('TuxCord')
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(false);

			const FIRST = new ActionRowBuilder().addComponents(TEXT);
			const SECOND = new ActionRowBuilder().addComponents(PASSWORD);

			VIEW.addComponents(FIRST, SECOND);

			return await Interaction.showModal(VIEW);
		}
		else if (COMMAND === 'attachment') {

			await Interaction.deferReply({ ephemeral: EPHEMERAL });

			await PGP('decrypt', { 'passphrase': PASS, 'file': FILE }).then(async data => {
				if (data) {

					if (data.match(/@(everyone|here|&\d+)(?![!])/g)) data = data.replace(/@(everyone|here|&\d+)(?![!])/g, '');

					if (data.replace(' ', '').length <= 0) return await Interaction.editReply('There is no data associated with this file.');

					return await Interaction.editReply({ content: data });
				}
			}, async (error) => {
				console.log(red(`[PGP] - ${error}`));
				return await Interaction.editReply(error);
			});

		}
		else {
			return Interaction.reply({ content: 'Please specify either the modal option or submit a file.',	ephemeral: true });
		}

	},
};
