import type { Interaction } from 'discord.js'
import type schema from './schema'

import { log } from '#lib/logger'

export default {
	name: 'interactionCreate',
	async on(BOT, DB, STORAGE, CONFIG, COMMANDS, interaction: Interaction) {
		let content = ''

		try {
			if (interaction.isChatInputCommand()) {
				const { commandName } = interaction
				const command = COMMANDS.find((cmd) => cmd.data.name === commandName)
				log('info', '[interaction/cmd] % was called', [commandName])

				if (!command) {
					log('error', '[interaction/cmd] % not found (guild % %)', [
						commandName,
						interaction.guild?.name,
						interaction.guild?.id,
					])
					content =
						"This command's settings is outdated. Please contact the maintainer about updating it."
				} else {
					content = 'There was an error while executing this command!'
					await command.execute(BOT, DB, STORAGE, CONFIG, interaction)
				}
			}
			// else if (interaction.isButton()) {
			// 	let button
			// 	const Regex = /^[a-zA-Z-]+ \| \d+$/g

			// 	const Match = interaction.customId.match(Regex)

			// 	if (Match) button = Bot.buttons.get('arch')
			// 	else button = Bot.buttons.get(interaction.customId)

			// 	// biome-ignore lint:
			// 	console.log(
			// 		green(`[Interaction] - ${interaction.customId} was executed.`),
			// 	)

			// 	if (!button) {
			// 		// biome-ignore lint:
			// 		console.log(
			// 			red(
			// 				`[Interaction] - Settings were outdated for ${interaction.guild.name} (${interaction.guild.id}).`,
			// 			),
			// 		)
			// 		content =
			// 			"This button's settings is outdated. Please contact the maintainer about updating it."
			// 	} else {
			// 		content = 'Internal error detected, please contact the maintainer!'
			// 		await button.execute(Bot, interaction)
			// 	}
			// }
			// else if (interaction.isModalSubmit()) {
			// 	// biome-ignore lint:
			// 	console.log(
			// 		green(
			// 			`[Interaction] - A modal event calling ${interaction.customId} was executed.`,
			// 		),
			// 	)

			// 	let modal

			// 	// FIXME Improve so we don't send to the wrong modal handler.
			// 	if (interaction.customId.includes('decrypt'))
			// 		modal = Bot.modals.get('decrypt')
			// 	else modal = Bot.modals.get(interaction.customId)

			// 	if (modal) modal.execute(Bot, interaction)
			// }
		} catch (error) {
			log('error', '%', [error])

			if (interaction.isChatInputCommand()) {
				try {
					return await interaction
						.reply({
							content: content,
							ephemeral: true,
						})
						.catch(console.error)
				} catch {
					return interaction
						.editReply({
							content: content,
						})
						.catch(console.error)
				}
			}
		}
	},
} as schema
