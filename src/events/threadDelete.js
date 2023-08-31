/**
 * Discord Bot ThreadDelete Event Handler
 * @module threadDelete
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-threadDelete}
 */
const PATH = require('path');
const { deleteEntry } = require(PATH.join(__dirname, '..', 'modules', 'database.js'));

module.exports = {
	name: 'threadDelete',
	once: false,
	/**
	 * Execute the bot's event handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').ThreadChannel} thread - A Discord thread channel
	 */
	async execute(BOT, DATABASE, thread) {

		deleteEntry(BOT, DATABASE, 'suggestions', thread).catch(err => {
			console.log(err);
		});

	},
};
