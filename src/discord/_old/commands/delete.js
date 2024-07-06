/**
 * Discord Bot Delete Command
 * @module delete
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const PATH = require('node:path')
const { deleteEntry } = require(
	PATH.join(__dirname, '..', 'modules', 'database.js'),
)

let config = null

try {
	config = require(PATH.join(__dirname, '..', 'config.json'))
} catch {
	// eslint-disable-next-line
}

const DEVELOPER_ID = process.env.DEVELOPER_ID ?? config?.DEVELOPER_ID ?? null
const PROTECTED_SUGGESTIONS_POST_ID =
	process.env.DEVELOPER_ID ?? config?.DEVELOPER_ID ?? null

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setNameLocalizations({
			'sv-SE': 'radera',
			'es-ES': 'eliminar',
		})
		.setDescription('Deletes values from the db')
		.setDescriptionLocalizations({
			'sv-SE': 'Raderar värden från databasen',
			'es-ES': 'Elimina valores de la base de datos',
		})
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setNameLocalizations({
					'sv-SE': 'kanal',
					'es-ES': 'canal',
				})
				.setDescription('the channel to delete')
				.setDescriptionLocalizations({
					'sv-SE': 'Kanalen att radera',
					'es-ES': 'El canal que eliminar',
				})
				.setRequired(true),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Interaction} interaction - A Discord interaction
	 */
	async execute(BOT, DATABASE, Interaction) {
		const CHANNEL = Interaction.options.getChannel('channel')

		if (Interaction.user.id !== DEVELOPER_ID)
			return await Interaction.reply({
				content: 'Only developers are allowed to use this command.',
				ephemeral: true,
			})
		if (CHANNEL.isThread() === false)
			return await Interaction.reply({
				content: 'This command can only accept forum posts.',
				ephemeral: true,
			})
		if (CHANNEL.id === PROTECTED_SUGGESTIONS_POST_ID)
			return await Interaction.reply({
				content: 'This command cannot be used on this post.',
				ephemeral: true,
			})

		await Interaction.deferReply({ ephemeral: true })

		deleteEntry(BOT, DATABASE, 'suggestions', CHANNEL).then(async () => {
			await Interaction.editReply({
				content: `The database entry ${CHANNEL.id} has been deleted.`,
			})
		}, console.error)
	},
}
