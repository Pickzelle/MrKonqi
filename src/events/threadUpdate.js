/**
 * Discord Bot ThreadUpdate Event Handler
 * @module threadUpdate
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-threadUpdate}
 */
const PATH = require('path');
const { insertEntry, deleteEntry, updateEntry } = require(PATH.join(__dirname, '..', 'modules', 'database.js'));
const { red } = require('chalk');

module.exports = {
	name: 'threadUpdate',
	once: false,
	/**
	 * Execute the bot's event handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').ThreadChannel} oldThread - A Discord thread channel
	 * @param {import('discord.js').ThreadChannel} newThread - A Discord thread channel
	*/
	async execute(BOT, DATABASE, oldThread, newThread) {

		if (newThread.archived) {

			deleteEntry(BOT, DATABASE, 'suggestions', oldThread).catch(err => {
				console.log(err);
			});

		}
		else {
			DATABASE.serialize(() => {
				DATABASE.get('SELECT * FROM suggestions WHERE id = ?', [newThread.id], (err, row) => {
					if (err) {
						console.error(red('[Database] - Error querying database:', err));
					}
					else if (row) {

						updateEntry(BOT, DATABASE, 'suggestions', newThread).catch(err => {
							console.log(err);
						});

					}
					else {

						insertEntry(BOT, DATABASE, 'suggestions', newThread).catch(err => {
							console.log(err);
						});

					}
				});
			});
		}
	},
};

