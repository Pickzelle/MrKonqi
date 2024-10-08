/**
 * Discord Bot ThreadCreate Event
 *
 * @module threadCreate
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-threadCreate}
 */
const Path = require('node:path')
const { insertEntry } = require(
	Path.join(__dirname, '..', 'modules', 'database.js'),
)

module.exports = {
	name: 'threadCreate',
	once: false,
	/**
	 * MrKonqi's thread creation logic.
	 *
	 * @param {import('discord.js').Client} Bot - The Discord bot client
	 * @param {import('sqlite3').Database} Database - SQLite3 database
	 * @param {import('discord.js').ThreadChannel} thread - A Discord thread channel
	 */
	execute(Bot, Database, _config, thread) {
		insertEntry(Bot, Database, 'suggestions', thread).catch((err) => {
			// biome-ignore lint:
			console.log(err)
		})
	},
}
