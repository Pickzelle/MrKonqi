import path from 'node:path'

const sqlite3 = require('sqlite3').verbose()
const { white, yellowBright } = require('chalk')

const debug = require('./modules/debug.js')

const DB_PATH = path.join(import.meta.dir, 'stored', 'suggestions.db')

export default function getDB() {
	const DB = new sqlite3.Database(DB_PATH, (err: unknown) => {
		if (err) {
			debug('[Database] - SQLite3', 1)
			return console.error(err)
		}

		debug('[Database] - SQLite3', 0)

		// The structure of support posts.
		DB.run(
			`
                CREATE TABLE IF NOT EXISTS suggestions (
                    id TEXT PRIMARY KEY,
                    status TEXT
                );
            `,
			(err: unknown) => {
				if (err) return console.error(err)

				// biome-ignore lint/suspicious/noConsoleLog: <explanation>
				console.log(white('-------------- Logs ---------------'))

				// Execute a SELECT statement to retrieve data from the table
				DB.all(
					'SELECT * FROM suggestions',
					(err: unknown, rows: { id: string; status: string }[]) => {
						if (err) {
							// biome-ignore lint/suspicious/noConsoleLog: <explanation>
							console.log(yellowBright("[Database] - Table doesn't exist yet."))
						} else if (rows.length > 0) {
							debug('Database Contents', 2)
							// biome-ignore lint/complexity/noForEach: <explanation>
							rows.forEach((row) => {
								debug(`${row.id} - ${row.status}`, 2)
							})
						} else {
							// biome-ignore lint/suspicious/noConsoleLog: <explanation>
							console.log(
								yellowBright('[Database] - Database contains no entires.'),
							)
						}
					},
				)
			},
		)
	})
}
