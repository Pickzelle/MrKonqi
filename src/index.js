const fs = require('node:fs');
const sqlite3 = require('sqlite3').verbose();
const { green, red, yellowBright, white } = require('chalk');
const { REST } = require('@discordjs/rest');

const {
	Client,
	IntentsBitField,
	Routes,
	Collection,
	Partials,
} = require('discord.js');

const PATH = require('node:path');

const STORED = 'stored';
const DB_PATH = PATH.join(__dirname, STORED, 'suggestions.db');
const debug = require(PATH.join(__dirname, 'modules', 'debug.js'));
let config = null;

// ----------------------------------------------------------------

try {
	config = require(PATH.join(__dirname, 'config.json'));
	debug('[Config]   - config.json', 0);
}
catch {
	debug('[Config]   - config.json', 1);
}

try {
	require('dotenv').config({ path: config.ENV });
	debug('[Module]   - Dotenv', 0);
}
catch {
	debug('[Module]   - Dotenv', 1);
}

const TOKEN = process.env.TOKEN ?? config?.TOKEN ?? null;
const GUILD_ID = process.env.GUILD_ID ?? config?.GUILD_ID ?? null;
const BOT_ID = process.env.BOT_ID ?? config?.BOT_ID ?? null;

const BOT = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.GuildIntegrations,
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.GuildMember,
		Partials.User,
		Partials.ThreadMember,
	],
});

BOT.commands = new Collection();
BOT.buttons = new Collection();
BOT.modals = new Collection();
const COMMANDS = [];

const EVENT_FILES = fs.readdirSync(PATH.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
const COMMAND_FILES = fs.readdirSync(PATH.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
const BUTTON_FILES = fs.readdirSync(PATH.join(__dirname, 'buttons')).filter(file => file.endsWith('.js'));
const MODAL_FILES = fs.readdirSync(PATH.join(__dirname, 'modals')).filter(file => file.endsWith('.js'));

// Create the parent directory if it doesn't exist
if (!fs.existsSync(PATH.join(__dirname, STORED))) {
	fs.mkdirSync(PATH.join(__dirname, STORED));
}

// Create the database file and define the schema
const DB = new sqlite3.Database(DB_PATH, (err) => {

	if (err) {
		debug('[Database] - SQLite3', 1);
		console.log(red(err));
	}
	else {
		debug('[Database] - SQLite3', 0);

		// The structure of support posts.
		DB.run(`
			CREATE TABLE IF NOT EXISTS suggestions (
				id TEXT PRIMARY KEY,
				status TEXT
			);
		`, (err) => {

			if (err) console.log(red(err));

			console.log(white('-------------- Logs ---------------'));

			// Execute a SELECT statement to retrieve data from the table
			DB.all('SELECT * FROM suggestions', (err, rows) => {

				if (err) {
					console.log(yellowBright('[Database] - Table doesn\'t exist yet.'));
				}
				else if (rows.length > 0) {
					debug('Database Contents', 2);
					rows.forEach((row) => {
						debug(`${row.id} - ${row.status}`, 2);
					});
				}
				else {
					console.log(yellowBright('[Database] - Database contains no entires.'));
				}
			});

		});

	}
});

// Loop through event files and register event handlers
for (const FILE of EVENT_FILES) {
	const event = require(PATH.join(__dirname, 'events', FILE));
	if (event.once) {
		BOT.once(event.name, (...args) => event.execute(BOT, DB, ...args));
	}
	else {
		BOT.on(event.name, (...args) => event.execute(BOT, DB, ...args));
	}
}

// Loop through command files and register commands
for (const FILE of COMMAND_FILES) {
	const command = require(PATH.join(__dirname, 'commands', FILE));

	debug(`[Command]  - ${FILE}`, command.data !== undefined ? 0 : 1);
	if (command.data == undefined) continue;

	COMMANDS.push(command.data.toJSON());
	BOT.commands.set(command.data.name, command);
}

// Loop through button files and register buttons
for (const FILE of BUTTON_FILES) {
	const button = require(PATH.join(__dirname, 'buttons', FILE));

	debug(`[Button]   - ${FILE}`, button.name !== undefined ? 0 : 1);
	if (button.name === undefined) continue;

	BOT.buttons.set(button.name, button);
}

// Loop through modal files and register modals
for (const FILE of MODAL_FILES) {
	const modal = require(PATH.join(__dirname, 'modals', FILE));

	debug(`[Modal]    - ${FILE}`, modal.name !== undefined ? 0 : 1);
	if (modal.name === undefined) continue;

	BOT.modals.set(modal.name, modal);
}

const REST_API = new REST({ version: '10' }).setToken(TOKEN);

REST_API.put(Routes.applicationCommands(BOT_ID, GUILD_ID), { body: COMMANDS })
	.then(() => console.log(green('[Bot] - Successfully registered application commands.')))
	.catch(console.error);

BOT.login(TOKEN).catch(err => console.log(red(err)));
