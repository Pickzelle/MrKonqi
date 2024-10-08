/**
 * Discord Bot Handle Command
 * @module handle
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const PATH = require('node:path')
const UPDATE = require(
	PATH.join(__dirname, '..', 'modules', 'updateFeatureRequest.js'),
)
const { insertEntry } = require(
	PATH.join(__dirname, '..', 'modules', 'database.js'),
)

let config = null

try {
	config = require(PATH.join(__dirname, '..', 'config.json'))
} catch {
	// eslint-disable-next-line
}

const SUGGESTIONS_CHANNEL_ID =
	process.env.SUGGESTIONS_CHANNEL_ID ?? config?.SUGGESTIONS_CHANNEL_ID ?? null
const PROTECTED_SUGGESTIONS_POST_ID =
	process.env.PROTECTED_SUGGESTIONS_POST_ID ??
	config?.PROTECTED_SUGGESTIONS_POST_ID ??
	null

/**
 * Updates the status of a suggestion in the database and replies to an interaction with the flagging information.
 *
 * @async
 * @param {Discord.Client} BOT - The Discord bot client.
 * @param {sqlite3.Database} DATABASE - The SQLite3 database instance.
 * @param {Discord.Interaction} Interaction - The Discord interaction object.
 * @param {string} TYPE - The flagging type to update the suggestion status with.
 */
async function insert(_BOT, DATABASE, Interaction, TYPE) {
	DATABASE.run(
		'UPDATE suggestions SET status = ? WHERE id = ?',
		[TYPE, Interaction.channel.id],
		(updateErr) => {
			if (updateErr) return
		},
	)

	await Interaction.reply({
		content: `This post has been flagged with \`${TYPE}\`.`,
		ephemeral: true,
	})
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('handle')
		.setNameLocalizations({
			'sv-SE': 'hantera',
			'es-ES': 'manejar',
		})
		.setDescription('Handles suggestion posts')
		.setDescriptionLocalizations({
			'sv-SE': 'Hanterar förslagsinlägg',
			'es-ES': 'Maneja posts de sugerencias',
		})
		.addSubcommand((subCommand) =>
			subCommand
				.setName('approve')
				.setNameLocalizations({
					'sv-SE': 'godkänn',
					'es-ES': 'aprobar',
				})
				.setDescription('Approves a feature request')
				.setDescriptionLocalizations({
					'sv-SE': 'Godkänner en funktionsbegäran',
					'es-ES': 'Aprueba una petición de característica',
				}),
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('deny')
				.setNameLocalizations({
					'sv-SE': 'neka',
					'es-ES': 'rechazar',
				})
				.setDescription('Denies a feature request')
				.setDescriptionLocalizations({
					'sv-SE': 'Nekar en funktionsbegäran',
					'es-ES': 'Rechaza una petición de característica',
				}),
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('details')
				.setNameLocalizations({
					'sv-SE': 'detaljer',
					'es-ES': 'detalles',
				})
				.setDescription('Asks that more details should be provided')
				.setDescriptionLocalizations({
					'sv-SE': 'Frågar om att mera detailjer behövs',
					'es-ES': 'Pide que se deben añadir más detalles',
				}),
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('wait')
				.setNameLocalizations({
					'sv-SE': 'vänta',
					'es-ES': 'esperar',
				})
				.setDescription('Reverts the feature request back to awaiting decision')
				.setDescriptionLocalizations({
					'sv-SE': 'Återgår funktionsbegäran till väntar på beslut',
					'es-ES':
						'Revierte una petición de característica a esperando una decisión',
				}),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Interaction} interaction - A Discord interaction
	 */
	async execute(BOT, DATABASE, Interaction) {
		const TYPE = Interaction.options.getSubcommand()

		if (Interaction.channel.isThread() === false)
			return await Interaction.reply({
				content: 'This command can only be used in forum posts.',
				ephemeral: true,
			})
		if (Interaction.channel.parent.id !== SUGGESTIONS_CHANNEL_ID)
			return await Interaction.reply({
				content: `This command can only be executed in <#${SUGGESTIONS_CHANNEL_ID}>.`,
				ephemeral: true,
			})
		if (Interaction.channel.id === PROTECTED_SUGGESTIONS_POST_ID)
			return await Interaction.reply({
				content: 'This command cannot be used in this post.',
				ephemeral: true,
			})
		if (Interaction.channel.locked)
			return await Interaction.reply({
				content: 'Only unlocked/active posts can be handled.',
				ephemeral: true,
			})

		DATABASE.serialize(async () => {
			DATABASE.get(
				'SELECT * FROM suggestions WHERE id = ?',
				[Interaction.channel.id],
				async (err, row) => {
					if (err) {
						console.error(err)
					} else if (!row) {
						insertEntry(
							BOT,
							DATABASE,
							'suggestions',
							Interaction.channel,
						).catch((err) => {
							console.error(err)
						})

						insert(BOT, DATABASE, Interaction, TYPE)
					} else if (row) {
						insert(BOT, DATABASE, Interaction, TYPE)
						await UPDATE(BOT, DATABASE, Interaction.channel)
					}
				},
			)
		})
	},
}
