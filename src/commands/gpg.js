/**
 * Discord Bot Gpg Command
 * @module arch
 */
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Component, ComponentType } = require('discord.js');
const gpg = require('#modules/gpg.js');

async function askForSignature(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('verify-gpg')
        .setTitle('Verify Identity');

    const signatureInput = new TextInputBuilder()
        .setCustomId('signature')
        .setLabel(`Sign: 'Yes, I'm ${interaction.user.id}'`)
        .setStyle(TextInputStyle.Paragraph);

    const actionRow = new ActionRowBuilder().addComponents(signatureInput);

    modal.addComponents(actionRow);
    await interaction.showModal(modal);
    const modalSubmit = await interaction.awaitModalSubmit({
        time: 15 * 60 * 1000, // 15 minutes
        filter: i => i.user.id === interaction.user.id,
    }).catch(error => {
        console.error(error);
    });
    if (modalSubmit) return modalSubmit;
}

function multipleKeysChoice(keys, id) {
    function formatKeyToField(key, i) {
        return {
            name: `${i}. **${key.keyid}**\n<t:${key.date.getTime() / 1000}>`,
            value: `[download](${key.dwUrl})\n` +
                key.uids.map(([identity, date]) =>
                    `${identity} <t:${date.getTime() / 1000}>`
                ).join('\n'),
            inline: false
        };
    }
    function formatKeyToMenuOption(key, i) {
        return new StringSelectMenuOptionBuilder()
            .setLabel(`${i}. ${key.keyid}`)
            .setDescription(`<t:${key.date.getTime() / 1000}>`)
            .setValue(key.dwUrl);
    }

    const select = new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder('Choose a key!')
        .addOptions(...keys.map(formatKeyToMenuOption));

    const row = new ActionRowBuilder()
        .addComponents(select);

    const embed = new EmbedBuilder()
        .setTitle('Select GPG key')
        .setFields(...keys.map(formatKeyToField))


    return { embeds: [embed], components: [row] };
}

function importKeyEmbed(importPromise, interaction) {
    importPromise.then(keyData => {
        interaction.reply('Sucessfully imported key!') // TODO: make nice and use keyData
    }).catch(err => {
        interaction.reply('Oops! something went wrong: ' + err)
    })
}

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

                    // Query keyservers for keys
                    let results = await gpgLib.searchKeyservers(query)
                        .catch(interaction.reply);
                    if (!results) return; // Only triggers if search failed

                    if (results.length == 0) {
                        // No keys found
                        interaction.reply('Counldn\'t find any result for the query');
                    } else if (results.length == 1) {
                        // One key found
                        const modalResponse = await askForSignature(interaction);
                        let signature = modalResponse.fields.fields.find(response => response.customId === 'signature').value;
                        // TODO: Verify signature before importing it
                        importKeyEmbed(importKey(results[0], interaction.user), modalResponse);
                    } else if (results.length <= 25) {
                        const reply = await interaction.reply(multipleKeysChoice(results, interaction.id));
                        const collector = reply.createMessageComponentCollector({
                            componentType: ComponentType.StringSelect,
                            filter: i => i.user.id === interaction.user.id && i.customId === interaction.id,
                            time: 60 * 1000 // 1min
                        });
                        collector.on('collect', interaction => {
                            const keyToImport = results.find(key => key.dwUrl === interaction.values[0]);
                            importKey(keyToImport);
                        })
                    } else {
                        interaction.reply('Too many entries, try a more specific query.');
                    }
                }
                else if (interaction.options._subcommand == 'file') {
                    let attachment = interaction.options._hoistedOptions
                        .find(option => option.name === 'file').attachment;

                    gpgLib.importKeyToUser(attachment.url, interaction.user)
                        .catch(interaction.reply);

                    const modalResponse = await askForSignature(interaction);
                    // TODO: Verify signature before importing
                    importKeyEmbed(importKey(attachment, interaction.user), modalResponse);
                }
                break;
        }
    }
};
