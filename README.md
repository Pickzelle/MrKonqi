<img src="./assets/Konqi.png" height=190>

# MrKonqi

MrKonqi is a Discord bot made for the TuxCord Discord server. It provides several features for moderation and general usage for the server's needs.

# Table of Contents

- [Description](#description)
- [Installation](#installation)
    - [Requirements](#requirements)
    - [Optional](#optional)
    - [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [Support](#support)
- [Maintainers](#maintainers)
    - [List of Maintainers](#list-of-maintainers)
    - [Contact](#contact)
- [Credits](#credits)
    - [Tyson Tan](#tyson-tan)
    - [Distributions](#distributions)
- [License](#license)

## Description

MrKonqi is a Discord bot used for moderating the TuxCord Discord server. He has the ability to fetch the newest packages from Arch's official repositories (and AUR). His main purpose is to provide support to the people in there and to make sure things run smoothly.

## Installation

### Requirements

- [node.js](https://nodejs.org/) v16.11.0+
- [discord.js](https://www.npmjs.com/package/discord.js) v14
- [chalk](https://www.npmjs.com/package/chalk) 4.1.2
- [sqlite3](https://www.npmjs.com/package/sqlite3) 5.1.6+
- [axios](https://www.npmjs.com/package/axios) 1.4.0+

> ⚠ Chalk 5 is ESM and therefore version 4 must be used.\
⚠ npm's sqlite3 package provdies SQLite3 bindings for Node.js® meaning that sqlite needs to be installed on the system.

```bash
git clone https://github.com/Pickzelle/MrKonqi.git
cd MrKonqi
npm install discord.js chalk@4.1.2 sqlite3 axios
```

### Optional

- nvm (Node Version Manager)
- ESLint
- Dotenv

> ⓘ nvm is a package used to manage versions of Node.js®. ([Install instructions](https://github.com/nvm-sh/nvm#installing-and-updating))\
> ⓘ ESLint can assist you in adhering to the same development ruleset as me. ([Install instructions](https://github.com/eslint/eslint#installation-and-usage))\
> ⓘ dotenv is a npm module used to load env files. 

> ⚠ These are optional packages and not required for the bot to work.

### Configuration

In the src directory of this repository, you'll find a [JSON](./src/config.json) file that governs the bot's behavior. To configure the bot, you can either modify the JSON file directly or utilize environment variables for configuration. The following values can be defined using either approach:

| Example | Description |
| --------------------- | ----------- |
| `TOKEN`=token | Represents the token of the Discord bot.
| `GUILD_ID`=id | Signifies the Guild ID on Discord where the commands will be sent.
| `BOT_ID`=id | Denotes the Discord bot's unique identification.
| `ENV`=path | Defines the path to the .env file.
| `DEVELOPER_ID`=id | The id the bot will reference to as the Developer.
| `DEBUG`=boolean | Specifies whether debugging mode is enabled or not.

Here's an example structure for your config.json file:

```json
{
    "TOKEN": "TOKEN",
    "GUILD_ID": "ID",
    "BOT_ID": "ID",
    "ENV": "PATH",
    "DEBUG": true,
    "DEVELOPER_ID": "ID",
}
```

Replace the placeholders with the actual values corresponding to your project. This configuration ensures that the bot operates effectively within the specified environment.

Alternatively, to use environment variables, you can name them in the same way as the JSON keys.

> ⓘ ENV and DEBUG are optional values and not required for the bot to function.\
> ⓘ Meanwhile, DEVELOPER\_ID must be specified due to some commands being developer-only.

> ⚠ Using environment variables will override the given values in the [JSON](./src/config.json) file.

Given that certain project values, such as channel and emoji IDs, have been excluded, it becomes imperative for you to proactively engage by incorporating pertinent values. It is essential to populate the ensuing files with requisite values, as their absence will inevitably render them non-functional. You can find more information in the files themselves.

[guildMemberAdd.js](./src/events/guildMemberAdd.js)\
[guildMemberRemove.js](./src/events/guildMemberRemove.js)

[updateFeatureRequest.js](./src/modules/updateFeatureRequest.js)

## Usage

Running the bot is as simple as being in its root directory and running: `node index.js`

Once the command is run, you should see the text `Ready! We're logged in as (bot)` indicating that its ready event has run and it's accepting commands.

## Contributing

Pull requests are welcome in case you want to contribute to the project. Any help is appreciated!

## Support

For general support about the bot, you can join the [TuxCord Discord server](https://discord.com/invite/HN8dYbDv2M).

## Maintainers

### List of Maintainers

- [@Pickzelle](https://github.com/Pickzelle) (PixeL)

### Contact

If you have any questions about the project, feel free to contact me on any of the ways in the list below.

- Discord: pickzelle

PixeL (me) serves as the sole maintainer for MrKonqi. Overseeing all aspects of its functionality, updates, and overall maintenance. Feel free to reach out to me if you have any questions, suggestions, or contributions related to MrKonqi.

## Credits

### Tyson Tan

MrKonqi uses several images by [Tyson Tan](https://tysontan.com/) which includes:

- KDE DEVELOPMENT APPLICATIONS FEATURING KONQI
- KDE PRESENTATION APPLICATIONS
- KDE SCIENCE APPLICATIONS
- KDE SUPPORT : DOCUMENTATION
- QT INSIDE
- Konqi and Katie with smartphones (modified)

These images are licensed under different licenses, respectively:

- [CC-BY-SA](https://creativecommons.org/licenses/by-sa/4.0/)
- [GNU GPL](https://www.gnu.org/licenses/licenses.html)
- [GNU LGPL](https://www.gnu.org/licenses/lgpl-3.0.html)
- [GFDL](https://www.gnu.org/licenses/fdl-1.3.en.html)

### Distributions

MrKonqi also uses artwork from several distributions which include:

- Arch Linux
    - The Arch Linux logo is used in accordance with the Arch Linux trademark policy under the [CC-BY-SA](https://creativecommons.org/licenses/by-sa/4.0/) license.
- Debian
    - The Debian logo is used under the terms of the [GNU LGPL](https://www.gnu.org/copyleft/lgpl.html), version 3 or any later version, or the [CC-BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

## License

MrKonqi is licensed under the GNU General Public License version 3.0. You can find the full text of the license in the [LICENSE](./LICENSE) file.
