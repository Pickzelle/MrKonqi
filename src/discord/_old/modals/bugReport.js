module.exports = {
	name: 'bugReport',

	/**
	 * MrKonqi's bug report logic.
	 *
	 * @param {import('discord.js').Client} Bot - The Discord bot client
	 * @param {import('discord.js').Interaction} Interaction - A Discord interaction
	 */
	async execute(_Bot, Interaction) {
		const Title = Interaction.fields.getTextInputValue('title')
		const Description = Interaction.fields.getTextInputValue('description')
		const Severity = Interaction.fields.getTextInputValue('severity')

		// biome-ignore lint:
		console.log({
			Title,
			Description,
			Severity,
		})

		await Interaction.reply({
			content:
				'Your bug report has been shared with the developer. Thanks for making me better!',
			ephemeral: true,
		})
	},
}
