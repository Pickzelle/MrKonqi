/**
 * Discord Bot InteractionCreate manager.
 * @module interactionCreate
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-interactionCreate}
 */
const { red, green } = require('chalk');

module.exports = {
	name: 'interactionCreate',
	/**
	 * Execute the bot's event handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Interaction} interaction - A Discord interaction
	 */
	async execute(BOT, DATABASE, Interaction) {

		const { commandName } = Interaction;
		let content = '';

		try {
			if (Interaction.isChatInputCommand()) {

				const COMMAND = Interaction.client.commands.get(commandName);
				console.log(green(`[Interaction] - A function in ${commandName} was called.`));

				if (!COMMAND) {
					console.log(red(`Outdated command ran in ${Interaction.guild.name} (${Interaction.guild.id}), please consider updating this!`));
					content = 'This command\'s settings is outdated. Please contact the maintainer about updating it.';
				}
				else {
					content = 'There was an error while executing this command!';
					await COMMAND.execute(BOT, DATABASE, Interaction);
				}
			}
			else if (Interaction.isButton()) {

				let button;
				const REGEX = /^[a-zA-Z-]+ \| \d+$/g;

				const MATCH = Interaction.customId.match(REGEX);

				if (MATCH) button = BOT.buttons.get('arch');
				else button = BOT.buttons.get(Interaction.customId);

				console.log(green(`[Interaction] - ${Interaction.customId} was executed.`));

				if (!button) {
					console.log(red(`[Interaction] - Settings were outdated for ${Interaction.guild.name} (${Interaction.guild.id}).`));
					content = 'This button\'s settings is outdated. Please contact the maintainer about updating it.';
				}
				else {
					content = 'Internal error detected, please contact the maintainer!';
					await button.execute(BOT, Interaction);
				}
			}
			else if (Interaction.isModalSubmit()) {

				console.log(green(`[Interaction] - A modal event calling ${Interaction.customId} was executed.`));

				const MODAL = BOT.modals.get(Interaction.customId);
				MODAL.execute(BOT, Interaction);

			}
		}
		catch (error) {

			console.log(red(`${error}`));

			try {
				return await Interaction.reply({ content: content, ephemeral: true }).catch(err => console.log(red(err)));
			}
			catch {
				return await Interaction.editReply({ content: content, ephemeral: true }).catch(err => console.log(red(err)));
			}
		}

	},
};
