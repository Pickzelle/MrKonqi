/**
 * Discord Bot Credits Command
 * @module credits
 */
const { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const PATH = require('path')
const LOGO = new AttachmentBuilder(PATH.join(__dirname, 'assets', 'dev-qt.png');
const CREDITS = new EmbedBuilder()
	.setTitle('Credits')
	.setDescription(`
MrKonqi is a Discord bot specially designed for TuxCord. This bot is developed and maintained by <@649531918374928395>. 
MrKonqi is tied to the GNU General Public License 3. You can view the repository here: [github](https://github.com/Pickzelle/MrKonqi)

MrKonqi offers a wide range of features to assist and support our community. From providing aid in support-related discussions 
to monitoring and ensuring the safety of our members, MrKonqi is here to lend a helping hand.

It's essential to note that while processing responses, MrKonqi may store anonymous information like forum post IDs.

MrKonqi also uses several images made by Tyson Tan, including:
- KDE DEVELOPMENT APPLICATIONS FEATURING KONQI
- KDE PRESENTATION APPLICATIONS
- KDE SCIENCE APPLICATIONS
- KDE SUPPORT : DOCUMENTATION
- QT INSIDE

These images are licensed under different licenses, respectively:
- [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [GNU GPL](https://www.gnu.org/licenses/licenses.html)
- [GNU LGPL](https://www.gnu.org/licenses/lgpl-3.0.html)
- [GFDL](https://www.gnu.org/licenses/fdl-1.3.en.html)
`)
	.setFooter({ text: 'Note: MrKonqi is not affiliated by any other software or program than its own.' })
	.setColor('#1793d1')
	.setThumbnail('attachment://dev-qt.png');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('credits')
		.setNameLocalizations({
			'sv-SE': 'kredit',
		})
		.setDescription('Shows credits and general info')
		.setDescriptionLocalizations({
			'sv-SE': 'Visar kredit och generell info',
		})
		.addBooleanOption(option => option
			.setName('ephemeral')
			.setNameLocalizations({
				'sv-SE': 'efemär',
			})
			.setDescription('Toggles whether or not this message should be ephemeral')
			.setDescriptionLocalizations({
				'sv-SE': 'Växlar om det här meddelandet ska vara kortvarigt eller inte',
			}),
		),

	/**
	 * Execute the bot's command handling logic.
	 *
	 * @param {import('discord.js').Client} BOT - The Discord bot client
	 * @param {import('sqlite3').Database} DATABASE - SQLite3 database
	 * @param {import('discord.js').Interaction} interaction - A Discord interaction
	*/
	async execute(BOT, DATABASE, Interaction) {

		const EPHEMERAL = Interaction.options.getBoolean('ephemeral') ?? true;
		await Interaction.reply({ embeds: [CREDITS], files: [LOGO], ephemeral: EPHEMERAL });

	},
};
