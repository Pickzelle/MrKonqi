const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const PATH = require('node:path')
const LOGO = new AttachmentBuilder(
	PATH.join(__dirname, '..', 'assets', 'science.png'),
)

/**
 * Updates the Feature Tracker.
 *
 * @async
 * @param {Discord.Client} BOT - The Discord bot client.
 * @param {sqlite3.Database} DATABASE - The SQLite3 database instance.
 * @param {import('discord.js').ThreadChannel} thread - A Discord thread channel
 */
const updateMsg = async (BOT, DATABASE, thread) => {
	// TODO automatically append the id to the config.json if we send it rather than editing one.

	// FIXME Add the Feature Tracker channel id here.
	const featureTracker = BOT.channels.cache.get('')

	let message

	try {
		// FIXME Link the message here. When you run it the first time, the bot will send a message to the channel rather than editing.
		// This however needs to be updated to the message once the bot has sent it, else you'll keep sending messages rather than updating.
		message = await featureTracker.messages.fetch('')
	} catch {
		message = null
	}

	// FIXME Add emoji IDs here.
	const guild = BOT.guilds.cache.get('')
	const emoji_idle = guild.emojis.cache.get('')
	const emoji_dnd = guild.emojis.cache.get('')
	const emoji_online = guild.emojis.cache.get('')
	const emoji_details = guild.emojis.cache.get('')

	const maxItems = 20

	let description = ''

	DATABASE.serialize(() => {
		DATABASE.get(
			'SELECT * FROM suggestions WHERE id = ?',
			[thread.id],
			(err) => {
				if (err) {
					console.error('Error querying database:', err)
				} else {
					displayFeatureTracker(DATABASE)
				}
			},
		)
	})

	/**
	 * Displays the Feature Tracker with a list of open requests and their statuses.
	 *
	 * @async
	 * @param {sqlite3.Database} DATABASE - The SQLite3 database instance.
	 */
	async function displayFeatureTracker(database) {
		let count = 0
		let statusEmoji

		description =
			// biome-ignore lint:
			'Welcome to the Feature Tracker! Down below are a list of open requests. Each request has an icon next to it to indicate its current status.\n\n' +
			`• ${emoji_idle} - The request is awaiting a decision.\n` +
			`• ${emoji_dnd} - The request has been denied.\n` +
			`• ${emoji_online} - The request is being implemented.\n` +
			`• ${emoji_details} - The request needs more details.\n\n` +
			'--------------------------------------------------\n\n'

		database.each(
			'SELECT * FROM suggestions ORDER BY id DESC',
			(err, row) => {
				if (err) {
					console.error('Error querying database:', err)
				} else if (count >= maxItems) {
					return
				}

				if (row.status === 'wait') statusEmoji = emoji_idle
				else if (row.status === 'deny') statusEmoji = emoji_dnd
				else if (row.status === 'approve') statusEmoji = emoji_online
				else if (row.status === 'details') statusEmoji = emoji_details

				description += `${statusEmoji} | <#${row.id}>\n`
				count++
			},
			() => {
				const EMBED = new EmbedBuilder()
					.setTitle('Feature Tracker')
					.setDescription(description)
					.setThumbnail('attachment://science.png')
					.setColor('#32cd32')

				try {
					message.edit({ embeds: [EMBED], files: [LOGO] })
				} catch {
					featureTracker
						.send({ embeds: [EMBED], files: [LOGO] })
						.catch(console.error)
				}
			},
		)
	}
}

module.exports = updateMsg
