/**
 * Discord Bot MessageCreate Event Handler
 * @module messageCreate
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-messageCreate}
 */
module.exports = {
	name: 'messageCreate',
	once: false,
	/**
	 * Execute the bot's event handling logic.
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Message} message - A Discord message
	 */
	execute(BOT, DATABASE, message) {

		if (message.channel.type === 1) {

			console.log({
				[message.author.id]: [
					message.author.username,
					message.content,
				],
			});

		}

	},
};
