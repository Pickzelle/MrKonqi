/**
 * Discord Bot Arch Command
 * @module arch
 */
const PATH = require('node:path');
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const AUR = require('#modules/callAUR.js');
const FETCH_PKGS = require('#modules/fetch-pkgs/index.js');
const LOGO = new AttachmentBuilder(PATH.join(__dirname, '../../assets/archlinux.png'));
const ROW = new ActionRowBuilder();
let embed = new EmbedBuilder();
const STORED = 'stored';
const { readdir, readFile } = require('node:fs/promises');
const MEMLIMIT = 512;
const LOCALE_LIB = require('#lib/locale.js');
const { getLocale, mergeLocalesKey, getDefaultLocaleKey } = LOCALE_LIB.extra;

// -------------------------

/**
 * Formats a size in bytes into a human-readable string with appropriate units.
 *
 * @param {number} sizeInBytes - The size to be formatted, in bytes.
 * @returns {string} The formatted size with units.
 */
function formatSize(sizeInBytes) {
	const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
	let size = parseFloat(sizeInBytes);

	let unitIndex = 0;
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return size.toFixed(2) + ' ' + units[unitIndex];
}

/**
 * Converts and updates properties of a PACKAGE object based on a given Repository string.
 *
 * @param {Object} PACKAGE - The object representing a package.
 * @param {string} Repository - The repository string used for mapping.
 */
function convertParsed(PACKAGE, PACKAGES, Repository) {

	const REPOSITORYREMAP = {
		'core': 'Core',
		'core-testing': 'Core-Testing',
		'extra': 'Extra',
		'extra-testing': 'Extra-Testing',
		'kde-unstable': 'KDE-Unstable',
		'multilib': 'Multilib',
		'multilib-testing': 'Multilib-Testing',
		'aur': 'AUR',
	};

	const PACKAGEREMAP = {
		'Architecture': 'ARCH',
		'Conflicts': 'CONFLICTS',
		'Depends': 'DEPENDS',
		'Description': 'DESC',
		'FirstSubmitted': 'FIRSTSUBMITTED',
		'ID': 'ID',
		'Keywords': 'KEYWORDS',
		'LastModified': 'LASTMODIFIED',
		'License': 'LICENSE',
		'Maintainer': 'MAINTAINER',
		'Maintainers': 'MAINTAINERS',
		'MakeDepends': 'MAKEDEPENDS',
		'Name': 'NAME',
		'NumVotes': 'NUMVOTES',
		'OutOfDate': 'OUTOFDATE',
		'PackageBase': 'BASE',
		'PackageBaseID': 'PACKAGEBASEID',
		'Popularity': 'POPULARITY',
		'Provides': 'PROVIDES',
		'Replaces': 'REPLACES',
		'Submitter': 'SUBMITTER',
		'URL': 'URL',
		'Version': 'VERSION',
	};

	// Select the correct repository to be displayed,
	if (Object.prototype.hasOwnProperty.call(REPOSITORYREMAP, Repository)) {
		PACKAGE.REPOSITORY = REPOSITORYREMAP[Repository];
	}

	// Allows for seamless conversion between AUR and official reps.
	for (const [oldName, newName] of Object.entries(PACKAGEREMAP)) {
		if (PACKAGE[oldName] || 'OutOfDate' in PACKAGE) {
			PACKAGE[newName] = PACKAGE[oldName];
			delete PACKAGE[oldName];
		}
	}

	PACKAGES.push(PACKAGE);

}

/**
 * Generates a field for displaying dependencies.
 *
 * @param {string} fieldName - The name of the field.
 * @param {string[]} dependencies - The list of dependencies.
 * @returns {Object} The field object.
 */
function addField(fieldName, dependencies, inline) {
	return {
		name: fieldName,
		value: typeof (dependencies) === 'string' ? dependencies : dependencies.map(dependency => `\n${dependency}`).join(' '),
		inline: inline,
	};
}

/**
 * Converts and updates properties of a PACKAGE object based on a given Repository string.
 *
 * @param {import('discord.js').Interaction} Interaction - A Discord interaction
 * @param {Object} PACKAGE - The object representing a package.
 * @param {Boolean} DEPENDENCIES - The dependency boolean.
 */
async function sendEmbed(Interaction, PACKAGE, DEPENDENCIES) {
	const locale = getLocale(Interaction.locale);

	const FIELDS = [];
	let description = '';
	const regex = /^([^<]+)/;

	if (PACKAGE.BASE && PACKAGE.VERSION) {
		embed.setTitle(`${PACKAGE.BASE} ${PACKAGE.VERSION}`);
	}

	description += locale['architecture:'].format(PACKAGE.ARCH || 'any');
	if (PACKAGE.REPOSITORY) description += locale['repository:'].format(PACKAGE.REPOSITORY);
	if (PACKAGE.DESC) description += locale['description:'].format(PACKAGE.DESC);
	if (PACKAGE.URL) description += locale['upstreamURL:'].format(PACKAGE.URL);
	if (PACKAGE.LICENSE) description += locale['license:'].format(PACKAGE.LICENSE);
	if (PACKAGE.PROVIDES) description += locale['provides:'].format(PACKAGE.PROVIDES.map(item => `\`${item}\``).join(' '));
	if (PACKAGE.REPLACES) description += locale['replaces:'].format(PACKAGE.REPLACES.map(item => `\`${item}\``).join(' '));
	if (PACKAGE.CONFLICTS) description += locale['replaces:'].format(PACKAGE.CONFLICTS.map(item => `\`${item}\``).join(' '));
	if (PACKAGE.CSIZE) description += locale['packageSize:'].format(formatSize(PACKAGE.CSIZE));
	if (PACKAGE.ISIZE) description += locale['installedSize:'].format(formatSize(PACKAGE.ISIZE));
	if (PACKAGE.PACKAGER) {
		const match = PACKAGE.PACKAGER.match(regex);
		if (match) description += locale['packager:'].format(match[1].trim());
	}
	if (PACKAGE.SUBMITTER) description += locale['submitter:'].format(PACKAGE.SUBMITTER);
	if (PACKAGE.MAINTAINER) description += locale['maintainer:'].format(PACKAGE.MAINTAINER);
	if (PACKAGE.NUMVOTES) description += locale['votes:'].format(PACKAGE.NUMVOTES);
	if (PACKAGE.POPULARITY) description += locale['popularity:'].format(PACKAGE.POPULARITY);
	if (PACKAGE.FIRSTSUBMITTED) description += locale['firstSubmitted:'].format(`<t:${PACKAGE.FIRSTSUBMITTED}:R>`);
	if (PACKAGE.LASTMODIFIED) description += locale['lastUpdated:'].format(`<t:${PACKAGE.LASTMODIFIED}:R>`);
	if (PACKAGE.BUILDDATE) description += locale['buildDate:'].format(`<t:${PACKAGE.BUILDDATE}:R>`);
	description += locale['outOfDate:'].format(PACKAGE.OUTOFDATE ? 'no' : `<t:${PACKAGE.OUTOFDATE}:f>`);

	if (DEPENDENCIES) {
		if (PACKAGE.DEPENDS) FIELDS.push(addField(locale['dependencies'], PACKAGE.DEPENDS, true));
		if (PACKAGE.OPTDEPENDS) FIELDS.push(addField(locale['optionalDependencies'], PACKAGE.OPTDEPENDS, true));
		if (PACKAGE.MAKEDEPENDS) FIELDS.push(addField(locale['makeDependencies'], PACKAGE.MAKEDEPENDS, true));
	}

	if (PACKAGE.REPOSITORY !== 'AUR') {
		const { lastFetchTimestamp } = JSON.parse(await readFile(PATH.join(__dirname, '..', STORED, 'timestamp.json')));
		FIELDS.push(addField(locale['lastSync'], `<t:${Math.round(lastFetchTimestamp / 1000)}:R>`, false));
	}

	embed
		.setDescription(description)
		.addFields(FIELDS)
		.setColor('#1793d1')
		.setThumbnail('attachment://archlinux.png');

	return await Interaction.editReply({ content: '', embeds: [embed], files: [LOGO] });
}

// -------------------------

module.exports = {
	data: new SlashCommandBuilder()
		.setName('arch')
		.setDescription(getDefaultLocaleKey('command-arch-description'))
		.setDescriptionLocalizations(mergeLocalesKey('command-arch-description'))
		.addStringOption(option => option
			.setName(getDefaultLocaleKey('command-arch-package-name'))
			.setDescription(getDefaultLocaleKey('command-arch-package-description'))
			.setRequired(true)
			.setNameLocalizations(mergeLocalesKey('command-arch-package-name'))
			.setDescriptionLocalizations(mergeLocalesKey('command-arch-package-description')),
		)
		.addStringOption(option => option
			.setName(getDefaultLocaleKey('command-arch-repository-name'))
			.setNameLocalizations(mergeLocalesKey('command-arch-repository-name'))
			.setDescription(getDefaultLocaleKey('command-arch-repository-description'))
			.setDescriptionLocalizations(mergeLocalesKey('command-arch-repository-description'))
			.addChoices(
				{ name: 'Core', value: 'core' },
				{ name: 'Core-Testing', value: 'core-testing' },
				{ name: 'Extra', value: 'extra' },
				{ name: 'Extra-Testing', value: 'extra-testing' },
				{ name: 'KDE-Unstable', value: 'kde-unstable' },
				{ name: 'Multilib', value: 'multilib' },
				{ name: 'Multilib-Testing', value: 'multilib-testing' },
				{ name: 'AUR', value: 'aur' },
			),
		)
		.addBooleanOption(option => option
			.setName(getDefaultLocaleKey('command-arch-dependencies-name'))
			.setNameLocalizations(mergeLocalesKey('command-arch-dependencies-name'))
			.setDescription(getDefaultLocaleKey('command-arch-dependencies-description'))
			.setDescriptionLocalizations(mergeLocalesKey('command-arch-dependencies-description')),
		)
		.addBooleanOption(option => option
			.setName(getDefaultLocaleKey('commands-ephemeral-name'))
			.setNameLocalizations(mergeLocalesKey('commands-ephemeral-name'))
			.setDescription(getDefaultLocaleKey('commands-ephemeral-description'))
			.setDescriptionLocalizations(mergeLocalesKey('commands-ephemeral-description')),
		),

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DB - SQLite3 database
	 * @param {import('discord.js').Interaction} Interaction - A Discord interaction
	*/
	async execute(BOT, DB, Interaction) {
		const locale = getLocale(Interaction.locale);

		const EPHEMERAL = Interaction.options.getBoolean(getDefaultLocaleKey('command-ephermal-name')) ?? true;
		const QUERY = Interaction.options.getString(getDefaultLocaleKey('command-arch-package-name'));
		const DEPENDENCIES = Interaction.options.getBoolean(getDefaultLocaleKey('command-arch-dependencies-name'));
		let Repository = Interaction.options.getString(getDefaultLocaleKey('command-arch-repository-name'));

		await Interaction.deferReply({ ephemeral: EPHEMERAL });

		// Redefining the embed to nullify it since it's defined at the top.
		embed = new EmbedBuilder();

		if ((Repository && Repository !== 'aur') || Repository === null) {

			// Check if DrKonqi is over his memory limit of 512 MiB.
			if (process.memoryUsage().rss / (1024 * 1024) > MEMLIMIT) {
				return await Interaction.editReply(locale['max-mem-cant-process']);
			}

			try {
				await FETCH_PKGS();
			}
			catch (error) {
				console.log(error);
			}

		}

		const DIRECTORY = await readdir(PATH.join(__dirname, '..', STORED));
		const REPOSITORIES = DIRECTORY.filter(file => file.endsWith('.json'));

		const PACKAGES = [];

		try {
			let packageFound = false;

			// If a specific repository is selected
			if (Repository && Repository !== 'aur') {

				const FILE = await readFile(PATH.join(__dirname, '..', STORED, `${Repository}.json`), 'utf-8');
				const PARSED = JSON.parse(FILE);

				if (QUERY in PARSED) {
					convertParsed(PARSED[QUERY], PACKAGES, Repository);
					packageFound = true;
				}
				else {
					return await Interaction.editReply(locale['cant-find-package-query-in-repo'].format(QUERY, Repository));
				}

			}
			// If AUR repository or no repository is selected
			else if (Repository === 'aur' || Repository === null) {

				const DATA = await AUR(QUERY);
				if (DATA.data.results[0]) {
					DATA.data.results[0].REPOSITORY = 'AUR';
					convertParsed(DATA.data.results[0], PACKAGES, Repository);
					packageFound = true;
				}
			}

			// If package is not found in the selected repository, search all repositories
			if (Repository === null) {

				for (Repository of REPOSITORIES) {
					const FILE = await readFile(PATH.join(__dirname, '..', STORED, Repository), 'utf-8');
					const PARSED = JSON.parse(FILE);
					Repository = Repository.replace('.json', '');

					if (QUERY in PARSED) {
						packageFound = true;
						convertParsed(PARSED[QUERY], PACKAGES, Repository);
					}
				}

			}

			if (!packageFound) {
				return await Interaction.editReply({ content: locale['cant-find-package-query'].format(QUERY) });
			}
			else if (PACKAGES.length >= 2) {

				ROW.components = [];
				let description = '';

				for (const PACKAGE of PACKAGES) {

					const BUTTON = new ButtonBuilder()
						.setCustomId(`${PACKAGE.REPOSITORY} | ${Interaction.user.id}`)
						.setLabel(PACKAGE.REPOSITORY)
						.setStyle(ButtonStyle.Primary);

					ROW.addComponents(BUTTON);

					description += `\n**${PACKAGE.BASE}** - \`${PACKAGE.REPOSITORY}\``;
				}

				embed
					.setTitle(locale['detected-name-confict'])
					.setColor('#1793d1')
					.setThumbnail('attachment://archlinux.png')
					.setDescription(
						locale['select-package-to-show']
							.format(description, DEPENDENCIES ? '\u2007' : ''),
					);

				// ! This line causes discord.js to use `buffer.Blob`, which is considered a experimental feature in this node version
				await Interaction.editReply({ content: '', embeds: [embed], files: [LOGO], components: [ROW] });

			}
			else if (PACKAGES.length === 1) {
				sendEmbed(Interaction, PACKAGES[0], DEPENDENCIES, embed);
			}

		}
		catch (error) {
			console.error(error);
		}

	},
};
