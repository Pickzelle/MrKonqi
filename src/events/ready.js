/**
 * Discord Bot Ready Event
 *
 * @module ready
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-ready}
 */
const { ActivityType } = require('discord.js');
const { GUILD_ID } = require('../config.json');
const { green } = require('chalk');
const { readFileSync } = require('node:fs');
const Path = require('node:path');

// Reads the package.json to get the version of the bot.
const Version = JSON.parse(readFileSync(Path.join(__dirname, '../../package.json'))).version;

// Array of status messages and their corresponding activity types
const Statuses = [
	{ text: 'Watching TuxCord!', type: ActivityType.Custom },
	{ text: 'Uptime: {uptime}.', type: ActivityType.Custom },
	{ text: 'Memory usage: {memory} MiB.', type: ActivityType.Custom },
	{ text: 'Engaging with {count} users.', type: ActivityType.Custom },
	{ text: 'Version: {version}.', type: ActivityType.Custom },
];

/**
 * Format seconds into a human-readable uptime string.
 *
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
 *
 * @param {import('discord.js').Guild} Guild - Represents a guild (or a server) on Discord.
 * @returns {Promise<number|null>} - Promise resolving to the member count or null on error
 */
async function fetchMemberCount(Guild) {

	return Guild.members.fetch()
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
	 * MrKonqi's ready event.
	 *
	 * @param {import('discord.js').Client} Bot - The Discord bot client
	 */
	async execute(Bot) {

		console.log(green(`[Bot] - Ready! We're logged in as ${Bot.user.tag}`));

		let amount;
		let currentStatusIndex = 0;
		const Guild = Bot.guilds.cache.get(GUILD_ID);

		// Manage status updates and cycle through different statuses
		setInterval(async () => {

			if (currentStatusIndex == 3) {
				amount = await fetchMemberCount(Guild);
				if (amount === null) {
					currentStatusIndex = (currentStatusIndex + 1) % Statuses.length;
				}
			}

			const MemoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
			const Uptime = formatUptime(process.uptime());
			const Status = Statuses[currentStatusIndex];

			// Format status text with dynamic values
			const updatedStatusText = Status.text
				.replace('{uptime}', Uptime)
				.replace('{count}', amount)
				.replace('{memory}', MemoryUsage)
				.replace('{version}', Version);

			Bot.user.setActivity(updatedStatusText, { type: Status.type });

			// Update currentStatusIndex to cycle through status messages
			currentStatusIndex = (currentStatusIndex + 1) % Statuses.length;

		}, 30000);

	},
};
