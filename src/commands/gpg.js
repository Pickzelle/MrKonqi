/**
 * Discord Bot Gpg Command
 * @module arch
 */
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const gpg = require('#modules/gpg.js');

// gpg
// └── import
//     ├── query
//     │   └── string (required)
//     └── file
//         └── attachment (required)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gpg')
        .setDescription('Allows to link your gpg key to your discord account or verify messages')
        .setDescriptionLocalizations({
            'es-ES': 'Permite enlazar tu clave gpg a tu cuenta de discord o verificar mensajes',
        })
        .addSubcommandGroup(subCommandGroup => subCommandGroup
            .setName('import')
            .setNameLocalizations({
                'es-ES': 'importar',
            })
            .setDescription('Imports a gpg key')
            .setDescriptionLocalizations({
                'es-ES': 'Importa una clave gpg',
            })
            .addSubcommand(subCommand => subCommand
                .setName('query')
                .setDescription('query')
                .addStringOption(keyID => keyID
                    .setName('query')
                    .setDescription('Query to look for on keyservers')
                    .setDescriptionLocalizations({
                        'es-ES': 'Busqueda que haver en los servidores de claves',
                    })
                    .setRequired(true)
                )
            )
            .addSubcommand(subCommand => subCommand
                .setName('file')
                .setNameLocalizations({
                    'es-ES': 'archivo',
                })
                .setDescription('Public key attachment')
                .addAttachmentOption(file => file
                    .setName('file')
                    .setNameLocalizations({
                        'es-ES': 'archivo',
                    })
                    .setDescription('Public key')
                    .setDescriptionLocalizations({
                        'es-ES': 'Clave pública',
                    })
                    .setRequired(true)
                )
            )
        ),

    /**
     * Execute the bot's command handling logic.
     *
     * @param {import('discord.js').Client} BOT - The Discord bot client
     * @param {import('sqlite3').Database} DATABASE - SQLite3 database
     * @param {import('discord.js').Interaction} interaction - A Discord interaction
    */
    async execute(BOT, DB, interaction) {
        const gpgLib = gpg(BOT, DB);

        function importKey(key) {
            gpgLib.importKeyToUser(key.dwUrl, interaction.user)
                .then(() => {
                    // !? make this a attractive embed if you want, key variable has plenty of information to put
                    interaction.reply('Successfully imported ' + key.keyid);
                })
                .catch(interaction.reply);
        }

        // interaction.user.id
        switch (interaction.options._group) {
            case 'import':
                if (interaction.options._subcommand == 'query') {
                    let query = interaction.options._hoistedOptions
                        .find(option => option.name === 'query').value;

                    let results = await gpgLib.searchKeyservers(query)
                        .catch(interaction.reply);
                    if (!results) return; // Only triggers if search failed

                    if (results.length == 0) {
                        interaction.reply('Counldn\'t find any result for the query');
                    } else if (results.length == 1) {
                        importKey(results[0]);
                    } else if (results.length <= 10) {
                        // !? show dialog (0-9 buttons max) and call importKey() on final key
                        interaction.reply('Found multiple entries, this is in development');
                    } else {
                        interaction.reply('Too many entries, try a more specific query.');
                    }
                }
                else if (interaction.options._subcommand == 'file') {
                    let attachment = interaction.options._hoistedOptions
                        .find(option => option.name === 'file').attachment;

                    gpgLib.importKeyToUser(attachment.url, interaction.user)
                        .catch(interaction.reply);

                    // !? make this an embed if you want (importKeyToUser could return key data such as id and be used here 🤔)
                    interaction.reply('Successfully imported key');
                }
                break;
        }
    }
};
