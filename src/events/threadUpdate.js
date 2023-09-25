/**
 * Discord Bot ThreadUpdate Event
 *
 * @module threadUpdate
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-threadUpdate}
 */
const Path = require('path');
const { insertEntry, deleteEntry, updateEntry } = require(Path.join(__dirname, '..', 'modules', 'database.js'));
const { red } = require('chalk');

module.exports = {
	name: 'threadUpdate',
	once: false,
	/**
	 * MrKonqi's thread update logic.
	 *
	 * @param {import('discord.js').Client} Bot - The Discord bot client
	 * @param {import('sqlite3').Database} Database - SQLite3 database
	 * @param {import('discord.js').ThreadChannel} oldThread - A Discord thread channel
	 * @param {import('discord.js').ThreadChannel} newThread - A Discord thread channel
	*/
	async execute(Bot, Database, oldThread, newThread) {

		if (newThread.archived) {

			deleteEntry(Bot, Database, 'suggestions', oldThread).catch(err => {
				console.log(err);
			});

		}
		else {
			Database.serialize(() => {
				Database.get('SELECT * FROM suggestions WHERE id = ?', [newThread.id], (err, row) => {
					if (err) {
						console.error(red('[Database] - Error querying database:', err));
					}
					else if (row) {

						updateEntry(Bot, Database, 'suggestions', newThread).catch(err => {
							console.log(err);
						});

					}
					else {

						insertEntry(Bot, Database, 'suggestions', newThread).catch(err => {
							console.log(err);
						});

					}
				});
			});
		}
	},
};

