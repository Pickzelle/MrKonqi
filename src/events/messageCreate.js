/**
 * Discord Bot MessageCreate Event
 *
 * @module messageCreate
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-messageCreate}
 */
module.exports = {
	name: 'messageCreate',
	once: false,
	/**
	 * MrKonqi's message handling logic.
	 *
	 * @param {import('discord.js').Client} Bot - The Discord bot client
	 * @param {import('sqlite3').Database} Database - SQLite3 database
	 * @param {import('discord.js').Message} message - A Discord message
	 */
	execute(Bot, Database, message) {

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
