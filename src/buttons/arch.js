const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { readFileSync } = require('node:fs');
const PATH = require('node:path');
const SPAWN = require('#modules/fetch-pkgs/index.js');
const ARCH = new AttachmentBuilder(PATH.join(__dirname, '..', '..', 'assets', 'archlinux.png'));

/**
 * Extracts unique package names from a given input string that contains package names in bold.
 *
 * @param {string} inputString - The input string containing package names in bold (**package**).
 * @returns {string[]} An array of unique package names extracted from the input string.
 */
function extractPackageName(inputString) {

	const regex = /\*\*([^*]+)\*\*/g;
	const matches = inputString.match(regex);

	// Filter out any duplicate package names
	const uniquePackageNames = Array.from(new Set(matches.map(match => match.replace(/\*\*/g, ''))));
	return uniquePackageNames;

}

/**
 * Extracts non-breaking spaces (U+2007) from a given input string.
 *
 * @param {string} inputString - The input string to extract non-breaking spaces from.
 * @returns {string[]} An array of non-breaking spaces (U+2007) extracted from the input string.
 */
function extractNonBreakingSpace(inputString) {

	// non-breaking space (U+2007)
	const regex = /\u2007/g;
	const matches = inputString.match(regex);
	return matches;

}

/**
 * Formats a size in bytes into a human-readable string with appropriate units.
 *
 * @param {number} sizeInBytes - The size to be formatted, in bytes.
 * @returns {string} The formatted size with units.
 */
function formatSize(sizeInBytes) {

	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let size = parseFloat(sizeInBytes);

	let unitIndex = 0;
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return size.toFixed(2) + ' ' + units[unitIndex];

}

module.exports = {
	name: 'arch',

	async execute(BOT, Interaction) {
		// Extract repository and user ID from customId.
		const repo = Interaction.customId.toLowerCase().match(/(.*?)\s*\|/)[1];
		const userId = Interaction.customId.toLowerCase().match(/\|+.([0-9]*)/)[1];

		// Check if the interaction is initiated by the same user who triggered it.
		if (Interaction.user.id !== userId) return;

		// Extract package data from the message embed.
		const package = Interaction.message.embeds[0].data.description;
		const ephemeral = Interaction.ephemeral;

		try {
			await SPAWN();
		}
		catch (e) {
			console.log(e);
		}

		const { lastFetchTimestamp } = JSON.parse(readFileSync(PATH.join(__dirname, '../stored', 'timestamp.json')));

		// Read the JSON file for the specific repository.
		const file = readFileSync(PATH.join(__dirname, `../stored/${repo}.json`), 'utf-8');
		const parsed = JSON.parse(file);
		const packageNames = extractPackageName(package);

		// Build the embed content.
		const EMBED = new EmbedBuilder();
		let description = '';
		const FIELDS = [];

		if (packageNames[0] in parsed) {
			const packageData = parsed[packageNames[0]];

			EMBED.setTitle(`${packageData.BASE} ${packageData.VERSION}`);

			// Append information to the description based on available data.
			if (packageData.ARCH) description = description + `**Architecture:** ${packageData.ARCH}\n`;
			if (repo) description = description + `**Repository:** ${repo.charAt(0).toUpperCase() + repo.slice(1)}\n`;
			if (packageData.DESC) description = description + `**Description:** ${packageData.DESC}\n`;
			if (packageData.URL) description = description + `**Upstream URL:** ${packageData.URL}\n`;
			if (packageData.LICENSE) description = description + `**License:** ${packageData.LICENSE}\n`;

			// Use template literals for providing arrays in the description.
			if (packageData.PROVIDES) description += `**Provides:** ${packageData.PROVIDES.map(item => `\`${item}\``).join(' ')}\n`;
			if (packageData.REPLACES) description += `**Replaces:** ${packageData.REPLACES.map(item => `\`${item}\``).join(' ')}\n`;
			if (packageData.CONFLICTS) description += `**Conflicts:** ${packageData.CONFLICTS.map(item => `\`${item}\``).join(' ')}\n`;

			if (packageData.CSIZE) description = description + `**Package Size:** ${formatSize(packageData.CSIZE)}\n`;
			if (packageData.ISIZE) description = description + `**Installed Size:** ${formatSize(packageData.ISIZE)}\n`;

			if (packageData.PACKAGER) {
				const MATCH = packageData.PACKAGER.match(/^([^<]+)/);
				description = description + `**Packager:** ${MATCH[1].trim()}\n`;
			}

			if (packageData.BUILDDATE) description = description + `**Build Date:** <t:${packageData.BUILDDATE}:R>\n\n`;

			// Check if dependencies should be shown.
			const showDepends = extractNonBreakingSpace(package);

			if (showDepends) {
				if (packageData.DEPENDS) {
					const dependsPackages = `${packageData.DEPENDS}`.split(',').map(packageName => `\n${packageName}`).join(' ');
					FIELDS.push({
						name: 'Dependencies',
						value: dependsPackages,
						inline: true,
					});
				}

				if (packageData.OPTDEPENDS) {
					const optDependsPackages = `${packageData.OPTDEPENDS}`.split(',').map(packageName => `\n${packageName}`).join(' ');
					FIELDS.push({
						name: 'Optional Dependencies',
						value: optDependsPackages,
						inline: true,
					});
				}

				if (packageData.MAKEDEPENDS) {
					const makeDependsPackages = `${packageData.MAKEDEPENDS}`.split(',').map(packageName => `\n${packageName}`).join(' ');
					FIELDS.push({
						name: 'Make Dependencies',
						value: makeDependsPackages,
						inline: true,
					});
				}

				EMBED.addFields(FIELDS);
			}

			EMBED.setDescription(description);
			EMBED.addFields({
				name: 'Last sync',
				value: `<t:${Math.round(lastFetchTimestamp / 1000)}:R>`,
				inline: false,
			});
			EMBED.setColor('#1793d1');
			EMBED.setThumbnail('attachment://archlinux.png');

			await Interaction.update({ embeds: [EMBED], components: [], files: [ARCH], ephemeral: ephemeral });
		}
		else {
			// This would run if the button is outdated.
			await Interaction.update({ embeds: [], components: [], files: [], content: 'The package is not in the selected repository any longer.', ephemeral: true });
		}

	},
};
