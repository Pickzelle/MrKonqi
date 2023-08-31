/**
 * Discord Bot GuildMemberRemove Event Handler
 * @module guildMemberRemove
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-guildMemberRemove}
 */
const { EmbedBuilder, UserFlags } = require('discord.js');

/**
 * Formats a Unix timestamp into a custom string format.
 *
 * @param {number} timestamp - The Unix timestamp to be formatted.
 * @param {string} USER - The username associated with the formatting.
 * @returns {string} The formatted timestamp string.
 */
function formatUnixTimestamp(timestamp, USER) {
	const DATE = new Date(timestamp * 1000);

	const YEAR = DATE.getFullYear();
	const MONTH = String(DATE.getMonth() + 1).padStart(2, '0');
	const DAY = String(DATE.getDate()).padStart(2, '0');
	const HOURS = String(DATE.getHours()).padStart(2, '0');
	const MINUTES = String(DATE.getMinutes()).padStart(2, '0');
	const SECONDS = String(DATE.getSeconds()).padStart(2, '0');

	return `> ${YEAR}-${MONTH}-${DAY}T${HOURS}:${MINUTES}:${SECONDS} /TuxCord ${USER} CREATE`;
}

module.exports = {
	name: 'guildMemberRemove',
	once: false,
	/**
	 * Execute the bot's event handling logic.
	 *
	 * @param {import('discord.js').Client} BOT
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').GuildMember} member
	 */
	execute(BOT, DATABASE, member) {

		// Add emoji IDs here.

		const FLAG = [];
		const USER = member.user;
		const GUILD = BOT.guilds.cache.get('');
		const EMOJI_DISCORD_EMPLOYEE = GUILD.emojis.cache.get('');
		const EMOJI_PARTNERED_SERVER_OWNER = GUILD.emojis.cache.get('');
		const EMOJI_HYPESQUAD_EVENTS = GUILD.emojis.cache.get('');
		const EMOJI_BUG_HUNTER_LEVEL_1 = GUILD.emojis.cache.get('');
		const EMOJI_HOUSE_BRAVERY = GUILD.emojis.cache.get('');
		const EMOJI_HOUSE_BRILLIANCE = GUILD.emojis.cache.get('');
		const EMOJI_HOUSE_BALANCE = GUILD.emojis.cache.get('');
		const EMOJI_EARLY_SUPPORTER = GUILD.emojis.cache.get('');
		const EMOJI_BUG_HUNTER_LEVEL_2 = GUILD.emojis.cache.get('');
		const EMOJI_VERIFIED_BOT = GUILD.emojis.cache.get('');
		const EMOJI_EARLY_VERIFIED_BOT_DEVELOPER = GUILD.emojis.cache.get('');
		const EMOJI_MODERATOR = GUILD.emojis.cache.get('');
		const EMOJI_ACTIVE_DEVELOPER = GUILD.emojis.cache.get('');
		const EMOJI_BOT = GUILD.emojis.cache.get('');

		if (USER.flags.has(UserFlags.Staff)) FLAG.push(EMOJI_DISCORD_EMPLOYEE);
		if (USER.flags.has(UserFlags.Partner)) FLAG.push(EMOJI_PARTNERED_SERVER_OWNER);
		if (USER.flags.has(UserFlags.Hypesquad)) FLAG.push(EMOJI_HYPESQUAD_EVENTS);
		if (USER.flags.has(UserFlags.BugHunterLevel1)) FLAG.push(EMOJI_BUG_HUNTER_LEVEL_1);
		if (USER.flags.has(UserFlags.HypeSquadOnlineHouse1)) FLAG.push(EMOJI_HOUSE_BRAVERY);
		if (USER.flags.has(UserFlags.HypeSquadOnlineHouse2)) FLAG.push(EMOJI_HOUSE_BRILLIANCE);
		if (USER.flags.has(UserFlags.HypeSquadOnlineHouse3)) FLAG.push(EMOJI_HOUSE_BALANCE);
		if (USER.flags.has(UserFlags.PremiumEarlySupporter)) FLAG.push(EMOJI_EARLY_SUPPORTER);
		if (USER.flags.has(UserFlags.BugHunterLevel2)) FLAG.push(EMOJI_BUG_HUNTER_LEVEL_2);

		if (USER.bot) {
			if (USER.flags.has(UserFlags.VerifiedBot)) FLAG.push(EMOJI_VERIFIED_BOT);
			else FLAG.push(EMOJI_BOT);
		}

		if (USER.flags.has(UserFlags.VerifiedDeveloper)) FLAG.push(EMOJI_EARLY_VERIFIED_BOT_DEVELOPER);
		if (USER.flags.has(UserFlags.CertifiedModerator)) FLAG.push(EMOJI_MODERATOR);
		if (USER.flags.has(UserFlags.ActiveDeveloper)) FLAG.push(EMOJI_ACTIVE_DEVELOPER);

		const EMBED = new EmbedBuilder()
			.setTitle('Member left')
			.setDescription(`**User ID:** ${USER.id}\n**Username:** ${USER.username}\n**Badges:** ${FLAG.length > 0 ? FLAG.join(' ') : 'none'}\n**Created:** <t:${Math.round(USER.createdTimestamp / 1000)}:R>`)
			.setThumbnail(`https://cdn.discordapp.com/avatars/${USER.id}/${USER.avatar}.png`)
			.setColor('Red');

		// Add channel IDs here.

		// Admin logs
		BOT.channels.cache.get('').send({ embeds: [EMBED] });

		// Public logs
		BOT.channels.cache.get('').send({ content: formatUnixTimestamp(member.joinedTimestamp / 1000, USER) });

	},
};
