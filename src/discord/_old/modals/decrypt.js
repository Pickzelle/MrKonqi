const PGP = require('../modules/pgp/index')
const { red } = require('chalk')

module.exports = {
	name: 'decrypt',

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} bot - The Discord bot client
	 * @param {import('discord.js').Interaction} Interaction - A Discord interaction
	 */
	async execute(_BOT, Interaction) {
		const MESSAGE = Interaction.fields.getTextInputValue('message')
		const PASS = Interaction.fields.getTextInputValue('password')
		const REGEX = /decrypt\s*\|\s*(null|false|true)\b/
		const IDMATCH = Interaction.customId.match(REGEX)
		const EPHEMERAL = IDMATCH && IDMATCH[1] === 'true'

		try {
			await PGP('decrypt', { passphrase: PASS, message: MESSAGE }).then(
				async (data) => {
					let mdata = data
					if (mdata.match(/@(everyone|here|&\d+)(?![!])/g))
						mdata = mdata.replace(/@(everyone|here|&\d+)(?![!])/g, '')
					if (mdata.length <= 0)
						return Interaction.reply(
							'There is no data associated with this file.',
						)

					if (mdata)
						return await Interaction.reply({
							content: mdata,
							ephemeral: EPHEMERAL,
						})
				},
				async (error) => {
					// biome-ignore lint:
					console.log(red(`[PGP] - ${error}`))
					return await Interaction.reply({ content: error, ephemeral: true })
				},
			)
		} catch (_e) {
			return Interaction.reply({
				content: "I'm unable to process that request.",
				ephemeral: true,
			})
		}
	},
}
