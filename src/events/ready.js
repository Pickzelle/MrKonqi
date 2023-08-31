/**
 * Discord Bot Ready Event Handler
 * @module ready
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-ready}
 */
const { ActivityType } = require('discord.js');
const { GUILD_ID } = require('../config.json');
const { green } = require('chalk');

// Current version of the bot
const VERSION = '1.0.0';

// Array of status messages and their corresponding activity types
const STATUSES = [
	{ text: 'Watching TuxCord!', type: ActivityType.Custom },
	{ text: 'Uptime: {uptime}.', type: ActivityType.Custom },
	{ text: 'Memory usage: {memory} MiB.', type: ActivityType.Custom },
	{ text: 'Engaging with {count} users.', type: ActivityType.Custom },
	{ text: 'Version: {version}.', type: ActivityType.Custom },
];

/**
 * Format seconds into a human-readable uptime string.
 * @param {number} seconds - Total seconds of uptime
 * @returns {string} - Formatted uptime string
 */
function formatUptime(seconds) {
	const days = Math.floor(seconds / (3600 * 24));
	const hours = Math.floor((seconds % (3600 * 24)) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
	else if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
	else if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
	else return 'less than a minute';
}

/**
 * Fetch the number of non-bot members in a guild
 * @param {object} GUILD - Discord guild object
 * @returns {Promise<number|null>} - Promise resolving to the member count or null on error
 */
async function fetchMemberCount(GUILD) {
	return GUILD.members.fetch()
		.then(members => members.filter(member => !member.user.bot).size)
		.catch(error => {
			console.error('Error fetching member count:', error);
			return null;
		});
}

module.exports = {
	name: 'ready',
	once: true,
	/**
	 * Execute the bot's event handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 */
	async execute(BOT) {

		console.log(green(`[Bot] - Ready! We're logged in as ${BOT.user.tag}`));

		let amount;
		let currentStatusIndex = 0;
		const GUILD = BOT.guilds.cache.get(GUILD_ID);

		// Manage status updates and cycle through different statuses
		setInterval(async () => {

			if (currentStatusIndex == 3) {
				amount = await fetchMemberCount(GUILD);
				if (amount === null) {
					currentStatusIndex = (currentStatusIndex + 1) % STATUSES.length;
				}
			}

			const MEMORYUSAGE = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
			const UPTIME = formatUptime(process.uptime());
			const STATUS = STATUSES[currentStatusIndex];

			// Format status text with dynamic values
			const updatedStatusText = STATUS.text
				.replace('{uptime}', UPTIME)
				.replace('{count}', amount)
				.replace('{memory}', MEMORYUSAGE)
				.replace('{version}', VERSION);

			BOT.user.setActivity(updatedStatusText, { type: STATUS.type });

			// Update currentStatusIndex to cycle through status messages
			currentStatusIndex = (currentStatusIndex + 1) % STATUSES.length;

		}, 30000);

	},
};
