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
 * @param {string} User - The username associated with the formatting.
 * @returns {string} The formatted timestamp string.
 */
function formatUnixTimestamp(timestamp, User) {
	const Date = new Date(timestamp * 1000);

	const Year = Date.getFullYear();
	const Month = String(Date.getMonth() + 1).padStart(2, '0');
	const Day = String(Date.getDate()).padStart(2, '0');
	const Hours = String(Date.getHours()).padStart(2, '0');
	const Minutes = String(Date.getMinutes()).padStart(2, '0');
	const Seconds = String(Date.getSeconds()).padStart(2, '0');

	return `> ${Year}-${Month}-${Day}T${Hours}:${Minutes}:${Seconds} /TuxCord ${User} CREATE`;
}

module.exports = {
	name: 'guildMemberRemove',
	once: false,
	/**
	 * Execute the bot's event handling logic.
	 *
	 * @param {import('discord.js').Client} Bot
	 * @param {import('sqlite3').Database} Database - SQLite3 database
	 * @param {import('discord.js').GuildMember} member
	 */
	execute(Bot, Database, member) {

		// Add emoji IDs here.

		const Flag = [];
		const User = member.user;
		const Guild = Bot.guilds.cache.get('');
		const EmojiDiscordEmployee = Guild.emojis.cache.get('');
		const EmojiPartneredServerOwner = Guild.emojis.cache.get('');
		const EmojiHypesquadEvents = Guild.emojis.cache.get('');
		const EmojiBugHunterLevel1 = Guild.emojis.cache.get('');
		const EmojiHouseBravery = Guild.emojis.cache.get('');
		const EmojiHouseBrilliance = Guild.emojis.cache.get('');
		const EmojiHouseBalance = Guild.emojis.cache.get('');
		const EmojiEarlySupporter = Guild.emojis.cache.get('');
		const EmojiBugHunterLevel2 = Guild.emojis.cache.get('');
		const EmojiVerifiedBot = Guild.emojis.cache.get('');
		const EmojiEarlyVerifiedBotDeveloper = Guild.emojis.cache.get('');
		const EmojiModerator = Guild.emojis.cache.get('');
		const EmojiActiveDeveloper = Guild.emojis.cache.get('');
		const EmojiBot = Guild.emojis.cache.get('');

		if (User.flags.has(UserFlags.Staff)) Flag.push(EmojiDiscordEmployee);
		if (User.flags.has(UserFlags.Partner)) Flag.push(EmojiPartneredServerOwner);
		if (User.flags.has(UserFlags.Hypesquad)) Flag.push(EmojiHypesquadEvents);
		if (User.flags.has(UserFlags.BugHunterLevel1)) Flag.push(EmojiBugHunterLevel1);
		if (User.flags.has(UserFlags.HypeSquadOnlineHouse1)) Flag.push(EmojiHouseBravery);
		if (User.flags.has(UserFlags.HypeSquadOnlineHouse2)) Flag.push(EmojiHouseBrilliance);
		if (User.flags.has(UserFlags.HypeSquadOnlineHouse3)) Flag.push(EmojiHouseBalance);
		if (User.flags.has(UserFlags.PremiumEarlySupporter)) Flag.push(EmojiEarlySupporter);
		if (User.flags.has(UserFlags.BugHunterLevel2)) Flag.push(EmojiBugHunterLevel2);

		if (User.bot) {
			if (User.flags.has(UserFlags.VerifiedBot)) Flag.push(EmojiVerifiedBot);
			else Flag.push(EmojiBot);
		}

		if (User.flags.has(UserFlags.VerifiedDeveloper)) Flag.push(EmojiEarlyVerifiedBotDeveloper);
		if (User.flags.has(UserFlags.CertifiedModerator)) Flag.push(EmojiModerator);
		if (User.flags.has(UserFlags.ActiveDeveloper)) Flag.push(EmojiActiveDeveloper);

		const Embed = new EmbedBuilder()
			.setTitle('Member left')
			.setDescription(`**User ID:** ${User.id}\n**Username:** ${User.username}\n**Badges:** ${Flag.length > 0 ? Flag.join(' ') : 'none'}\n**Created:** <t:${Math.round(User.createdTimestamp / 1000)}:R>`)
			.setThumbnail(`https://cdn.discordapp.com/avatars/${User.id}/${User.avatar}.png`)
			.setColor('Red');

		// Add channel IDs here.

		// Admin logs
		Bot.channels.cache.get('').send({ embeds: [Embed] });

		// Public logs
		Bot.channels.cache.get('').send({ content: formatUnixTimestamp(member.joinedTimestamp / 1000, User) });

	},
};
