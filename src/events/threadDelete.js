/**
 * Discord Bot ThreadDelete Event
 *
 * @module threadDelete
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-threadDelete}
 */
const Path = require('path');
const { deleteEntry } = require(Path.join(__dirname, '..', 'modules', 'database.js'));

module.exports = {
	name: 'threadDelete',
	once: false,
	/**
	 * MrKonqi's thread deletion logic.
	 *
	 * @param {import('discord.js').Client} Bot - The Discord bot client
	 * @param {import('sqlite3').Database} Database - SQLite3 database
	 * @param {import('discord.js').ThreadChannel} thread - A Discord thread channel
	 */
	async execute(Bot, Database, thread) {

		deleteEntry(Bot, Database, 'suggestions', thread).catch(err => {
			console.log(err);
		});

	},
};
