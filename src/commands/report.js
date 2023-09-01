/**
 * Discord Bot Report Command
 * @module report
 */
const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('report')
		.setNameLocalizations({
			'sv-SE': 'rapportera',
			'es-ES': 'reportar',
		})
		.setDescription('Different commands to report certain events')
		.setDescriptionLocalizations({
			'sv-SE': 'Olika kommandon för att rapportera vissa händelser',
			'es-ES': 'Diferentes comandos para reportar ciertos eventos'
		})
		.addSubcommand(subcommand => subcommand
			.setName('user')
			.setNameLocalizations({
				'sv-SE': 'användare',
				'es-ES': 'usuario',
			})
			.setDescription('Report a user for breaking the rules')
			.setDescriptionLocalizations({
				'sv-SE': 'Rapporterar en användare för att ha brutit mot reglerna',
				'es-ES': 'Reportar un usuario por romper las reglas',
			})
			.addUserOption(option => option
				.setName('target')
				.setNameLocalizations({
					'sv-SE': 'mål',
					'es-ES': 'objectivo',
				})
				.setDescription('The user to report')
				.setDescriptionLocalizations({
					'sv-SE': 'Användaren att rapportera',
					'es-ES': 'El usuario al cual reportar',
				})
				.setRequired(true),
			)
			.addStringOption(option => option
				.setName('cause')
				.setNameLocalizations({
					'sv-SE': 'anledning',
					'es-ES': 'causa',
				})
				.setDescription('Why you\'re reporting the user')
				.setDescriptionLocalizations({
					'sv-SE': 'Din anledning som leder till rapporten',
					'es-ES': 'La razon por la que reportas al usuario',
				})
				.setRequired(true),
			)
			.addStringOption(option => option
				.setName('link')
				.setNameLocalizations({
					'sv-SE': 'länk',
					'es-ES': 'enlace',
				})
				.setDescription('The link of the message related to the incident')
				.setDescriptionLocalizations({
					'sv-SE': 'Länken till meddelandet relaterat till incidenten',
					'es-ES': 'Enlace del mensaje relatado al incidente',
				}),
			)
			.addAttachmentOption(option => option
				.setName('attachment')
				.setNameLocalizations({
					'sv-SE': 'fil',
					'es-ES': 'adjunto',
				})
				.setDescription('An attachment related to the incident')
				.setDescriptionLocalizations({
					'sv-SE': 'En fil relaterad till incidenten',
					'es-ES': 'Un adjunto relatado al incidente',
				}),
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName('bug')
			.setNameLocalizations({
				'sv-SE': 'bugg',
				'es-ES': 'bug',
			})
			.setDescription('Generate a bug report')
			.setDescriptionLocalizations({
				'sv-SE': 'Skapa en bugg rapport',
				'es-ES': 'Genera un reporte de bug',
			}),
		),

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Interaction} interaction - A Discord interaction
	*/
	async execute(BOT, DATABASE, Interaction) {

		const COMMAND = Interaction.options.getSubcommand();

		if (COMMAND === 'bug') {

			const MODAL = new ModalBuilder()
				.setCustomId('bugReport')
				.setTitle('Bug Report');

			const TITLE = new TextInputBuilder()
				.setCustomId('title')
				.setLabel('Title')
				.setPlaceholder('Briefly describe the bug')
				.setStyle(TextInputStyle.Short)
				.setMaxLength(25);

			const DESCRIPTION = new TextInputBuilder()
				.setCustomId('description')
				.setLabel('Tell us more about the bug')
				.setPlaceholder('Provide a detailed description of the bug')
				.setStyle(TextInputStyle.Short);

			const LEVEL = new TextInputBuilder()
				.setCustomId('severity')
				.setLabel('How severe is this bug?')
				.setPlaceholder('Low/Medium/High/Critical')
				.setStyle(TextInputStyle.Short)
				.setMaxLength(10);

			const arr = [TITLE, DESCRIPTION, LEVEL];

			for (const VAL of arr) {
				const toAdd = new ActionRowBuilder().addComponents(VAL);
				MODAL.addComponents(toAdd);
			}

			await Interaction.showModal(MODAL);

		}
		else if (COMMAND === 'user') {
			return await Interaction.reply({ content: 'This command is still being developed.', ephemeral: true });
		}

	},
};
