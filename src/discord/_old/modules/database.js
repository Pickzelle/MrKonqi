const PATH = require('node:path')
const updateMsg = require(
	PATH.join(__dirname, '..', 'modules', 'updateFeatureRequest.js'),
)
const { green, red, yellowBright } = require('chalk')

const PARENTID = '1135517684189122601'

/**
 * Updates an entry in the database table with the specified status for a given channel.
 *
 * @param {Discord.Client} BOT - The Discord bot client.
 * @param {sqlite3.Database} DATABASE - The SQLite3 database instance.
 * @param {string} TABLE - The name of the database table.
 * @param {Discord.TextChannel} channel - The Discord text channel to update.
 * @returns {Promise<void>} A promise that resolves when the update is completed successfully.
 * @throws {Error} If the channel's parent ID is incorrect.
 */
function updateEntry(BOT, DATABASE, TABLE, channel) {
	return new Promise((resolve, reject) => {
		if (channel.parent.id !== PARENTID)
			return reject(red('[Database] - Parent is incorrect'))

		DATABASE.run(
			`UPDATE ${TABLE} SET status = ? WHERE id = ?`,
			['wait', channel.id],
			(updateErr) => {
				if (updateErr) {
					// biome-ignore lint:
					console.log(updateErr)
				} else {
					resolve()
					// biome-ignore lint:
					console.log(green(`[Database] - ${channel.id} updated.`))
					updateMsg(BOT, DATABASE, channel)
				}
			},
		)
	})
}

/**
 * Inserts an entry into the database table with the specified status for a given channel.
 *
 * @param {Discord.Client} BOT - The Discord bot client.
 * @param {sqlite3.Database} DATABASE - The SQLite3 database instance.
 * @param {string} TABLE - The name of the database table.
 * @param {Discord.TextChannel} channel - The Discord text channel to update.
 * @param {string} [status='wait'] - The status value to insert (default: 'wait').
 * @returns {Promise<void>} A promise that resolves when the insertion is completed successfully.
 * @throws {Error} If the channel's parent ID is incorrect or there's an error during insertion.
 */
function insertEntry(BOT, DATABASE, TABLE, channel, status) {
	return new Promise((resolve, reject) => {
		if (channel.parent.id !== PARENTID)
			return reject(red('[Database] - Parent is incorrect'))

		DATABASE.run(
			`CREATE TABLE IF NOT EXISTS ${TABLE} (id TEXT PRIMARY KEY, status TEXT)`,
		)
		DATABASE.run(
			`INSERT INTO ${TABLE} (id, status) VALUES (?, ?)`,
			[channel.id, status || 'wait'],
			async (err) => {
				if (err) {
					return reject('[Database] - ', err)
				}
				// biome-ignore lint:
				console.log(green(`[Database] - ${channel.id} inserted.`))
				await updateMsg(BOT, DATABASE, channel)
				return resolve()
			},
		)
	})
}

/**
 * Deletes an entry from the database table for a given channel.
 *
 * @param {Discord.Client} bot - The Discord bot client.
 * @param {sqlite3.Database} db - The SQLite3 database instance.
 * @param {string} table - The name of the database table.
 * @param {Discord.TextChannel} channel - The Discord text channel to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is completed successfully.
 * @throws {Error} If the channel's parent ID is incorrect, the channel is not found,
 * or there's an error during deletion.
 */
function deleteEntry(BOT, DATABASE, table, channel) {
	return new Promise((resolve, reject) => {
		if (channel.parent.id !== PARENTID)
			return reject(red('[Database] - Parent is incorrect'))

		DATABASE.serialize(() => {
			DATABASE.run(
				`CREATE TABLE IF NOT EXISTS ${table} (id TEXT PRIMARY KEY, status TEXT)`,
			)
			DATABASE.get(
				`SELECT * FROM ${table} WHERE id = ?`,
				[channel.id],
				(err, row) => {
					if (err) {
						// biome-ignore lint:
						console.log(
							yellowBright(`[Database] - ${channel.id} not found in database.`),
						)
					} else if (row) {
						DATABASE.run(
							`DELETE FROM ${table} WHERE id = ?`,
							[channel.id],
							(deleteErr) => {
								if (deleteErr) {
									reject(`[Database] - ${deleteErr}`)
								} else {
									// biome-ignore lint:
									console.log(green(`[Database] - ${channel.id} deleted.`))
									updateMsg(BOT, DATABASE, channel)
									resolve()
								}
							},
						)
					} else if (channel.archived) {
						reject(
							yellowBright(
								'[Database] - The post was archived and has since been deleted.',
							),
						)
					} else {
						reject(`[Database] - ${channel.id} not in database?`)
					}
				},
			)
		})
	})
}

module.exports = {
	insertEntry,
	deleteEntry,
	updateEntry,
}
