/**
 * Discord Bot Help Command
 * @module help
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const EMBED = new EmbedBuilder()
	.setTitle('Help')
	.setDescription('Hello! I\'m MrKonqi! I monitor this server and provide assistance to the people here! Down below is a list of my commands. If you have any questions about my functionality, you can ping one of the mods in here!')
	.addFields([
		{
			name: '/arch `package` `repository` `dependencies` `ephemeral`',
			value: 'Fetches package info from the Arch repos.' },
		{
			name: '/report bug',
			value: 'Generates a bug report to be sent to the developer.',
		},
	])
	.setColor('#32cd32');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setNameLocalizations({
			'sv-SE': 'hjälp',
			'es-ES': 'ayuda',
		})
		.setDescription('Gives you a list of my commands')
		.setDescriptionLocalizations({
			'sv-SE': 'Ger dig en lista av mina kommandon',
			'es-ES': 'Ofrece una lista de mis comandos',
		}),

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Interaction} interaction - A Discord interaction
	*/
	async execute(BOT, DATABASE, Interaction) {

		Interaction.reply({ embeds: [EMBED], ephemeral: true });

	},
};
