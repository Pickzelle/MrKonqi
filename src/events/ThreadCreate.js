/**
 * Discord Bot ThreadCreate Event Handler
 * @module threadCreate
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-threadCreate}
 */
const PATH = require('path');
const { insertEntry } = require(PATH.join(__dirname, '..', 'modules', 'database.js'));

module.exports = {
	name: 'threadCreate',
	once: false,
	/**
	 * Execute the bot's event handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').ThreadChannel} thread - A Discord thread channel
	 */
	execute(BOT, DATABASE, thread) {

		insertEntry(BOT, DATABASE, 'suggestions', thread).catch(err => {
			console.log(err);
		});

	},
};
