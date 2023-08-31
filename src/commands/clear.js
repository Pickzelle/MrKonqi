/**
 * Discord Bot Clear Command
 * @module clear
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

/**
 * Fetches the target user by their ID from the guild of the given interaction.
 *
 * @param {Discord.Interaction} interaction - The Discord.js interaction object.
 * @param {string} id - The user ID to fetch.
 * @returns {Promise<?Discord.GuildMember>} The fetched guild member, or null if not found.
 */
async function fetchTargetUser(Interaction, id) {
	if (!id) return null;

	try {
		return await Interaction.guild.members.fetch(id);
	}
	catch {
		return null;
	}
}

/**
 * Fetches the ID of a webhook from a given interaction's channel.
 *
 * @param {Discord.Interaction} interaction - The Discord.js interaction object.
 * @param {string} id - The webhook ID to search for.
 * @returns {Promise<?string>} The ID of the found webhook, or null if not found.
 */
async function fetchWebhookId(Interaction, id) {
	if (!id) return null;

	const webhooks = await Interaction.channel.fetchWebhooks();
	const filteredWebhooks = webhooks.filter(hook => hook.id === id);
	return filteredWebhooks.first()?.id || null;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setNameLocalizations({
			'sv-SE': 'rensa',
		})
		.setDescription('Clears a given amount of messages in a channel')
		.setDescriptionLocalizations({
			'sv-SE': 'rensar ett givet nummer av meddelanden i en kanal',
		})
		.addNumberOption(option => option
			.setName('amount')
			.setNameLocalizations({
				'sv-SE': 'mängd',
			})
			.setDescription('The amount of messages to delete')
			.setDescriptionLocalizations({
				'sv-SE': 'Antalet meddelanden att radera',
			})
			.setRequired(true),
		)
		.addStringOption(option => option
			.setName('id')
			.setDescription('The id of the account you want to filter with')
			.setDescriptionLocalizations({
				'sv-SE': 'ID:t för det konto som du vill filtrera med',
			}),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Interaction} interaction - A Discord interaction
	*/
	async execute(BOT, DATABASE, Interaction) {

		const id = Interaction.options.getString('id');
		const targetUser = await fetchTargetUser(Interaction, id);
		const webhook = await fetchWebhookId(Interaction, id);

		const maxMessagesToDelete = Interaction.options.getNumber('amount');

		let lastMessageId = null;
		let messagesDeleted = 0;
		let counter = 0;
		let messagesToDelete;

		if (maxMessagesToDelete > 300) return await Interaction.reply({ content: 'Sorry, but I will not handle deletion requests with an amount over `300`.', ephemeral: true });

		// Defer initial reply to indicate bot is working on the request
		await Interaction.deferReply({ ephemeral: true });

		while (messagesDeleted < maxMessagesToDelete) {

			const fetchedMessages = await Interaction.channel.messages.fetch({
				limit: 100,
				before: lastMessageId,
				cache: false,
			});

			// Filter messages based on conditions
			if (targetUser) messagesToDelete = fetchedMessages.filter((msg) => msg.author.id === targetUser.user.id);
			else if (webhook) messagesToDelete = fetchedMessages.filter((msg) => msg.author.id === webhook);
			else messagesToDelete = messagesToDelete = fetchedMessages;

			// If 5 consecutive attempts have been made to fetch a user's messages with no result, we break
			if (messagesToDelete.size == 0) {
				if (counter >= 5) {
					console.log('No more messages could be found..');
					break;
				}
				counter++;
				continue;
			}

			// Try to bulk delete messages, if not, delete individually
			try {
				const deletedMessages = await Interaction.channel.bulkDelete(messagesToDelete.first(maxMessagesToDelete));
				messagesDeleted += deletedMessages.size;
				counter = 0;
			}
			catch (e) {
				for (const msg of messagesToDelete.values()) {

					if (messagesDeleted >= maxMessagesToDelete) break;

					try {
						// Delete messages one by one
						await msg.delete();
						messagesDeleted++;
					}
					catch (err) {
						// Handle permission errors
						console.log('Permission error detected. Probably race condition.');
						break;
					}

					lastMessageId = msg.id;
					counter = 0;

				}
			}

		}

		// Alert the user about the action(s) we took.
		if (targetUser) {
			const userMessage = messagesDeleted === 0
				? `I couldn't delete any messages from ${targetUser.user.username}`
				: `Deleted ${messagesDeleted} messages from ${targetUser.user.username}`;
			await Interaction.editReply(userMessage);
		}
		else {
			const channelMessage = messagesDeleted === 0
				? 'I wasn\'t able to delete any messages in this channel.'
				: `Deleted ${messagesDeleted} messages.`;
			await Interaction.editReply(channelMessage);
		}

	},
};
