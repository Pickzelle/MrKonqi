/**
 * Discord Bot Arch Command
 * @module arch
 */
const PATH = require('node:path')
const {
	SlashCommandBuilder,
	EmbedBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require('discord.js')
const AUR = require('../modules/callAUR')
const FETCH_PKGS = require('../modules/fetch-pkgs/index')
const LOGO = new AttachmentBuilder(
	PATH.join(__dirname, '..', '..', 'assets', 'archlinux.png'),
)
const ROW = new ActionRowBuilder()
let embed = new EmbedBuilder()
const STORED = 'stored'
const { readdir, readFile } = require('node:fs/promises')
const { hsize_b } = require('#util/units')
const MEMLIMIT = 512

// -------------------------

/**
 * Converts and updates properties of a PACKAGE object based on a given Repository string.
 *
 * @param {Object} PACKAGE - The object representing a package.
 * @param {string} Repository - The repository string used for mapping.
 */
function convertParsed(PACKAGE, PACKAGES, Repository) {
	const REPOSITORYREMAP = {
		core: 'Core',
		'core-testing': 'Core-Testing',
		extra: 'Extra',
		'extra-testing': 'Extra-Testing',
		'kde-unstable': 'KDE-Unstable',
		multilib: 'Multilib',
		'multilib-testing': 'Multilib-Testing',
		aur: 'AUR',
	}

	const PACKAGEREMAP = {
		Architecture: 'ARCH',
		Conflicts: 'CONFLICTS',
		Depends: 'DEPENDS',
		Description: 'DESC',
		FirstSubmitted: 'FIRSTSUBMITTED',
		ID: 'ID',
		Keywords: 'KEYWORDS',
		LastModified: 'LASTMODIFIED',
		License: 'LICENSE',
		Maintainer: 'MAINTAINER',
		Maintainers: 'MAINTAINERS',
		MakeDepends: 'MAKEDEPENDS',
		Name: 'NAME',
		NumVotes: 'NUMVOTES',
		OutOfDate: 'OUTOFDATE',
		PackageBase: 'BASE',
		PackageBaseID: 'PACKAGEBASEID',
		Popularity: 'POPULARITY',
		Provides: 'PROVIDES',
		Replaces: 'REPLACES',
		Submitter: 'SUBMITTER',
		URL: 'URL',
		Version: 'VERSION',
	}

	// Select the correct repository to be displayed,
	if (Object.prototype.hasOwnProperty.call(REPOSITORYREMAP, Repository)) {
		PACKAGE.REPOSITORY = REPOSITORYREMAP[Repository]
	}

	// Allows for seamless conversion between AUR and official reps.
	for (const [oldName, newName] of Object.entries(PACKAGEREMAP)) {
		if (PACKAGE[oldName] || 'OutOfDate' in PACKAGE) {
			PACKAGE[newName] = PACKAGE[oldName]
			delete PACKAGE[oldName]
		}
	}

	PACKAGES.push(PACKAGE)
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
		value:
			typeof dependencies === 'string'
				? dependencies
				: dependencies.map((dependency) => `\n${dependency}`).join(' '),
		inline: inline,
	}
}

/**
 * Converts and updates properties of a PACKAGE object based on a given Repository string.
 *
 * @param {import('discord.js').Interaction} Interaction - A Discord interaction
 * @param {Object} PACKAGE - The object representing a package.
 * @param {Boolean} DEPENDENCIES - The dependency boolean.
 */
async function sendEmbed(Interaction, PACKAGE, DEPENDENCIES) {
	const FIELDS = []
	let description = ''
	const regex = /^([^<]+)/

	if (PACKAGE.BASE && PACKAGE.VERSION) {
		embed.setTitle(`${PACKAGE.BASE} ${PACKAGE.VERSION}`)
	}

	description += PACKAGE.ARCH
		? `**Architecture:** ${PACKAGE.ARCH}\n`
		: '**Architecture:** any\n'
	if (PACKAGE.REPOSITORY)
		description += `**Repository:** ${PACKAGE.REPOSITORY}\n`
	if (PACKAGE.DESC) description += `**Description:** ${PACKAGE.DESC}\n`
	if (PACKAGE.URL) description += `**Upstream URL:** ${PACKAGE.URL}\n`
	if (PACKAGE.LICENSE) description += `**License:** ${PACKAGE.LICENSE}\n`
	if (PACKAGE.PROVIDES)
		description += `**Provides:** ${PACKAGE.PROVIDES.map((item) => `\`${item}\``).join(' ')}\n`
	if (PACKAGE.REPLACES)
		description += `**Replaces:** ${PACKAGE.REPLACES.map((item) => `\`${item}\``).join(' ')}\n`
	if (PACKAGE.CONFLICTS)
		description += `**Replaces:** ${PACKAGE.CONFLICTS.map((item) => `\`${item}\``).join(' ')}\n`
	if (PACKAGE.CSIZE)
		description += `**Package Size:** ${hsize_b(PACKAGE.CSIZE, 2)}\n`
	if (PACKAGE.ISIZE)
		description += `**Installed Size:** ${hsize_b(PACKAGE.ISIZE, 2)}\n`
	if (PACKAGE.PACKAGER) {
		const match = PACKAGE.PACKAGER.match(regex)
		if (match) description += `**Packager:** ${match[1].trim()}\n`
	}
	if (PACKAGE.SUBMITTER) description += `**Submitter:** ${PACKAGE.SUBMITTER}\n`
	if (PACKAGE.MAINTAINER)
		description += `**Maintainer:** ${PACKAGE.MAINTAINER}\n`
	if (PACKAGE.NUMVOTES) description += `**Votes:** ${PACKAGE.NUMVOTES}\n`
	if (PACKAGE.POPULARITY)
		description += `**Popularity:** ${PACKAGE.POPULARITY}\n`
	if (PACKAGE.FIRSTSUBMITTED)
		description += `**First Submitted:** <t:${PACKAGE.FIRSTSUBMITTED}:R>\n`
	if (PACKAGE.LASTMODIFIED)
		description += `**Last Updated:** <t:${PACKAGE.LASTMODIFIED}:R>\n`
	if (PACKAGE.BUILDDATE)
		description += `**Build Date:** <t:${PACKAGE.BUILDDATE}:R>\n`
	description +=
		PACKAGE.OUTOFDATE === undefined
			? '**Out-of-date:** no.\n'
			: `**Out-of-date:** <t:${PACKAGE.OUTOFDATE}:f>\n`

	if (DEPENDENCIES) {
		if (PACKAGE.DEPENDS)
			FIELDS.push(addField('Dependencies', PACKAGE.DEPENDS, true))
		if (PACKAGE.OPTDEPENDS)
			FIELDS.push(addField('Optional Dependencies', PACKAGE.OPTDEPENDS, true))
		if (PACKAGE.MAKEDEPENDS)
			FIELDS.push(addField('Make Dependencies', PACKAGE.MAKEDEPENDS, true))
	}

	if (PACKAGE.REPOSITORY !== 'AUR') {
		const { lastFetchTimestamp } = JSON.parse(
			await readFile(PATH.join(__dirname, '..', STORED, 'timestamp.json')),
		)
		FIELDS.push(
			addField(
				'Last sync',
				`<t:${Math.round(lastFetchTimestamp / 1000)}:R>`,
				false,
			),
		)
	}

	embed
		.setDescription(description)
		.addFields(FIELDS)
		.setColor('#1793d1')
		.setThumbnail('attachment://archlinux.png')

	return await Interaction.editReply({
		content: '',
		embeds: [embed],
		files: [LOGO],
	})
}

// -------------------------

module.exports = {
	data: new SlashCommandBuilder()
		.setName('arch')
		.setDescription(
			'Performs a search in the Arch package database for packages',
		)
		.setDescriptionLocalizations({
			'sv-SE': 'Utför en sökning i Archs paketförråd efter paket',
			'es-ES': 'Hace una busqueda de paquetes en la base de datos de Arch',
		})
		.addStringOption((option) =>
			option
				.setName('package')
				.setDescription("The package you're searching for")
				.setRequired(true)
				.setNameLocalizations({
					'sv-SE': 'paket',
					'es-ES': 'paquete',
				})
				.setDescriptionLocalizations({
					'sv-SE': 'Paketet du vill söka efter',
					'es-ES': 'El paquete que buscas',
				}),
		)
		.addStringOption((option) =>
			option
				.setName('repository')
				.setNameLocalizations({
					'sv-SE': 'paketförråd',
					'es-ES': 'repositorio',
				})
				.setDescription('Which repository to fetch from')
				.setDescriptionLocalizations({
					'sv-SE': 'Vilket paketförråd att söka igenom',
					'es-ES': 'De que repositorio buscar',
				})
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
		.addBooleanOption((option) =>
			option
				.setName('dependencies')
				.setNameLocalizations({
					'sv-SE': 'beroenden',
					'es-ES': 'dependencias',
				})
				.setDescription(
					'Whether or not to show dependencies for the given package',
				)
				.setDescriptionLocalizations({
					'sv-SE':
						'Huruvida beroenden för det givna paketet ska visas eller inte',
					'es-ES': 'Si mostrar o no las dependencias del paquete',
				}),
		)
		.addBooleanOption((option) =>
			option
				.setName('ephemeral')
				.setNameLocalizations({
					'sv-SE': 'efemär',
					'es-ES': 'efímero',
				})
				.setDescription(
					'Toggles whether or not this message should be ephemeral',
				)
				.setDescriptionLocalizations({
					'sv-SE': 'Växlar om detta meddelande ska vara kortlivat eller inte',
					'es-ES': 'Establece si este mensaje debería ser efímero',
				}),
		),

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Interaction} interaction - A Discord interaction
	 */
	async execute(_BOT, _DB, Interaction) {
		const EPHEMERAL = Interaction.options.getBoolean('ephemeral') ?? true
		const QUERY = Interaction.options.getString('package')
		const DEPENDENCIES = Interaction.options.getBoolean('dependencies')
		let Repository = Interaction.options.getString('repository')

		await Interaction.deferReply({ ephemeral: EPHEMERAL })

		// Redefining the embed to nullify it since it's defined at the top.
		embed = new EmbedBuilder()

		if ((Repository && Repository !== 'aur') || Repository === null) {
			// Check if DrKonqi is over his memory limit of 512 MiB.
			if (process.memoryUsage().rss / (1024 * 1024) > MEMLIMIT) {
				return await Interaction.editReply(
					"I'm currently running at max memory and therefore unable to handle your request. Please try again later.",
				)
			}

			try {
				await FETCH_PKGS()
			} catch (error) {
				console.error(error)
			}
		}

		const DIRECTORY = await readdir(PATH.join(__dirname, '..', STORED))
		const REPOSITORIES = DIRECTORY.filter((file) => file.endsWith('.json'))

		const PACKAGES = []

		try {
			let packageFound = false

			// If a specific repository is selected
			if (Repository && Repository !== 'aur') {
				const FILE = await readFile(
					PATH.join(__dirname, '..', STORED, `${Repository}.json`),
					'utf-8',
				)
				const PARSED = JSON.parse(FILE)

				if (QUERY in PARSED) {
					convertParsed(PARSED[QUERY], PACKAGES, Repository)
					packageFound = true
				} else {
					return await Interaction.editReply(
						`I'm sorry, I couldn't find a package named **${QUERY}** in the **${Repository}** repository.`,
					)
				}
			}
			// If AUR repository or no repository is selected
			else if (Repository === 'aur' || Repository === null) {
				const DATA = await AUR(QUERY)
				if (DATA.data.results[0]) {
					DATA.data.results[0].REPOSITORY = 'AUR'
					convertParsed(DATA.data.results[0], PACKAGES, Repository)
					packageFound = true
				}
			}

			// If package is not found in the selected repository, search all repositories
			if (Repository === null) {
				for (Repository of REPOSITORIES) {
					const FILE = await readFile(
						PATH.join(__dirname, '..', STORED, Repository),
						'utf-8',
					)
					const PARSED = JSON.parse(FILE)
					Repository = Repository.replace('.json', '')

					if (QUERY in PARSED) {
						packageFound = true
						convertParsed(PARSED[QUERY], PACKAGES, Repository)
					}
				}
			}

			if (!packageFound) {
				return await Interaction.editReply({
					content: `I'm sorry, I couldn't find a package named **${QUERY}** in the repos.`,
				})
			}
			if (PACKAGES.length >= 2) {
				ROW.components = []
				let description = ''

				for (const PACKAGE of PACKAGES) {
					const BUTTON = new ButtonBuilder()
						.setCustomId(`${PACKAGE.REPOSITORY} | ${Interaction.user.id}`)
						.setLabel(PACKAGE.REPOSITORY)
						.setStyle(ButtonStyle.Primary)

					ROW.addComponents(BUTTON)

					description += `\n**${PACKAGE.BASE}** - \`${PACKAGE.REPOSITORY}\``
				}

				embed
					.setTitle('Name conflict detected!')
					.setColor('#1793d1')
					.setThumbnail('attachment://archlinux.png')

				if (DEPENDENCIES)
					embed.setDescription(
						`Please select which package you want to show.\u2007\n${description}`,
					)
				else
					embed.setDescription(
						`Please select which package you want to show.\n${description}`,
					)

				// ! This line causes discord.js to use `buffer.Blob`, which is considered a experimental feature in this node version
				await Interaction.editReply({
					content: '',
					embeds: [embed],
					files: [LOGO],
					components: [ROW],
				})
			} else if (PACKAGES.length === 1) {
				sendEmbed(Interaction, PACKAGES[0], DEPENDENCIES, embed)
			}
		} catch (error) {
			console.error(error)
		}
	},
}
