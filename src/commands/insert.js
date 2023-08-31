/**
 * Discord Bot Insert Command
 * @module insert
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const PATH = require('node:path');
const { insertEntry } = require(PATH.join(__dirname, '..', 'modules', 'database.js'));

let config = null;

try {
	config = require(PATH.join(__dirname, '..', 'config.json'));
}
// eslint-disable-next-line
catch {}

const DEVELOPER_ID = process.env.DEVELOPER_ID ?? config?.DEVELOPER_ID ?? null;
const SUGGESTIONS_CHANNEL_ID = process.env.DEVELOPER_ID ?? config?.DEVELOPER_ID ?? null;
const PROTECTED_SUGGESTIONS_POST_ID = process.env.DEVELOPER_ID ?? config?.DEVELOPER_ID ?? null;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('insert')
		.setNameLocalizations({
			'sv-SE': 'infoga',
		})
		.setDescription('Inserts values into the database')
		.setDescriptionLocalizations({
			'sv-SE': 'Infogar värden till databasen',
		})
		.addChannelOption(option => option
			.setName('channel')
			.setNameLocalizations({
				'sv-SE': 'kanal',
			})
			.setDescription('The channel to insert')
			.setDescriptionLocalizations({
				'sv-SE': 'Kanalen att infoga',
			})
			.setRequired(true),
		)
		.addStringOption(option => option
			.setName('status')
			.setDescription('The status to give it')
			.setDescriptionLocalizations({
				'sv-SE': 'Statusen att ge den',
			})
			.addChoices(
				{ name: 'wait', value: 'wait' },
				{ name: 'approve', value: 'approve' },
				{ name: 'deny', value: 'deny' },
				{ name: 'details', value: 'details' },
			),
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

		if (Interaction.user.id !== DEVELOPER_ID) return await Interaction.reply({ content: 'Only developers are allowed to use this command.', ephemeral: true });

		const channel = Interaction.options.getChannel('channel');
		const status = Interaction.options.getString('status');

		if (channel.isThread() == false) return await Interaction.reply({ content: 'This command can only accept forum posts.', ephemeral: true });
		if (channel.parent.id !== SUGGESTIONS_CHANNEL_ID) return await Interaction.reply({ content: `This command can only be executed for <#${SUGGESTIONS_CHANNEL_ID}> channels.`, ephemeral: true });
		if (channel.id == PROTECTED_SUGGESTIONS_POST_ID) return await Interaction.reply({ content: 'This command cannot be used on this post.', ephemeral: true });

		await Interaction.deferReply({ ephemeral: true });

		insertEntry(BOT, DATABASE, 'supportThreads', channel, status).then(async () => {
			await Interaction.editReply({ content: `The database entry ${channel.id} has been inserted with the status ${status}.` });
		}, err => console.log(err));

	},
};
