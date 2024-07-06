/**
 * Discord Bot InteractionCreate manager.
 *
 * @module interactionCreate
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-interactionCreate}
 */
const { red, green } = require('chalk')

module.exports = {
	name: 'interactionCreate',
	/**
	 * MrKonqi's interaction handling logic.
	 *
	 * @param {import('discord.js').Client} Bot - The Discord bot client
	 * @param {import('sqlite3').Database} Database - SQLite3 database
	 * @param {import('discord.js').Interaction} Interaction - A Discord interaction
	 */
	async execute(Bot, Database, _config, Interaction) {
		const { commandName } = Interaction
		let content = ''

		try {
			if (Interaction.isChatInputCommand()) {
				const Command = Interaction.client.commands.get(commandName)
				// biome-ignore lint:
				console.log(
					green(`[Interaction] - A function in ${commandName} was called.`),
				)

				if (!Command) {
					// biome-ignore lint:
					console.log(
						red(
							`Outdated command ran in ${Interaction.guild.name} (${Interaction.guild.id}), please consider updating this!`,
						),
					)
					content =
						"This command's settings is outdated. Please contact the maintainer about updating it."
				} else {
					content = 'There was an error while executing this command!'
					await Command.execute(Bot, Database, Interaction)
				}
			} else if (Interaction.isButton()) {
				let button
				const Regex = /^[a-zA-Z-]+ \| \d+$/g

				const Match = Interaction.customId.match(Regex)

				if (Match) button = Bot.buttons.get('arch')
				else button = Bot.buttons.get(Interaction.customId)

				// biome-ignore lint:
				console.log(
					green(`[Interaction] - ${Interaction.customId} was executed.`),
				)

				if (!button) {
					// biome-ignore lint:
					console.log(
						red(
							`[Interaction] - Settings were outdated for ${Interaction.guild.name} (${Interaction.guild.id}).`,
						),
					)
					content =
						"This button's settings is outdated. Please contact the maintainer about updating it."
				} else {
					content = 'Internal error detected, please contact the maintainer!'
					await button.execute(Bot, Interaction)
				}
			} else if (Interaction.isModalSubmit()) {
				// biome-ignore lint:
				console.log(
					green(
						`[Interaction] - A modal event calling ${Interaction.customId} was executed.`,
					),
				)

				let modal

				// FIXME Improve so we don't send to the wrong modal handler.
				if (Interaction.customId.includes('decrypt'))
					modal = Bot.modals.get('decrypt')
				else modal = Bot.modals.get(Interaction.customId)

				if (modal) modal.execute(Bot, Interaction)
			}
		} catch (error) {
			// biome-ignore lint:
			console.log(red(`${error}`))

			try {
				return await Interaction.reply({
					content: content,
					ephemeral: true,
				}).catch(console.error)
			} catch {
				return Interaction.editReply({
					content: content,
					ephemeral: true,
				}).catch(console.error)
			}
		}
	},
}
