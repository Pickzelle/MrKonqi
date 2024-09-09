<img src="./assets/Konqi.png" height=190>

# MrKonqi

MrKonqi is a Discord bot made for the TuxCord Discord server. It provides several features for moderation and general usage for the server's needs.

# Table of Contents

- [MrKonqi](#mrkonqi)
- [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Installation](#installation)
    - [Requirements](#requirements)
      - [Prisma](#prisma)
    - [Configuration](#configuration)
  - [Behavior](#behavior)
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

- [bunjs](https://bun.sh/) v1.1.18+ recommended
- `package.lock` dependencies
- [paralload](https://github.com/ErrorNoInternet/Paralload) either on `$PATH` or configured in `config.path.paralload`

> [!WARNING]
> sqlite3 version requires SQLite installed on the system.
> This dependency might become unused soon

```bash
git clone https://github.com/Pickzelle/MrKonqi.git
cd MrKonqi
bun i --frozen-lockfile
```

> [!NOTE]
> You can pass `--production` to `bun i` to ignore development dependencies, these are not required for functionality, just development experience

#### Prisma
One last step is generating the prisma client, this can be done through `bun run gen:prisma` (`bun run gen` runs all generation scripts, including json schema generation ones, which won't work without development dependencies).

Before that, we need a URL to access the Postgres DB, provided by the environmental variable `DATABASE_URL` or imported by default if placed in `.env` file.

> [!NOTE]
> The script must be ran after any change in the prisma scheme or to regenerate the client, there's no problem with running even if the schema is up to date.

<!-- maybe place this steps along with possible troubleahooting (missing schemas, pitdated version...) in another file? -->
If you decide to set up your own Postgres DB, you'll need some basic unix terminal knowledge:
* Install the necessary packages
* Get the service active, either enable permanently or start it before this project.
* Then, if you don't want to set up detailed permissions and just want it to work (taking `konqi` as database and user name, and `password` as password):
```sh
[user@machine ~]$ sudo/doas su - postgres
[postgres@machine ~]$ createuser konqi
[postgres@machine ~]$ createdb konqi
[postgres@machine ~]$ psql
psql (15.4)
Type "help" for help.

postgres=# alter user konqi with encrypted password 'password';
ALTER ROLE
postgres=# grant all privileges on database konqi to konqi;
GRANT
postgres=alter user konqi createdb;
ALTER ROLE
postgres=\c konqi postgres
You are now connected to database "konqi" as user "postgres".
konqi=# grant all on schema public to konqi;
GRANT
postgres=# ^D
\q
could not save history to file "/var/lib/postgres/.psql_history": No such file or directory
[postgres@machine ~]$ ^D
[user@machine ~]$ ^D
```
(`^D` being <kbd>Ctrl</kbd> + <kbd>D</kbd>)
* And finally just place our DB URL of format `postgresql://<user>:<password>@<host>:<port>/<dbname>` in `.env` (following example assumes previous case with standard defaults)
```env
DATABASE_URL="postgresql://konqi:password@127.0.0.1:5432/konqi"
```

### Configuration

In `config/config.template.jsonc` you'll find a [JSON](./src/config.template.json) template file that governs the bot's behavior.

To configure the bot you have to copy that file as `config/config.json` and edit it accordingly, replacing the placeholders with the actual values corresponding to your project, don't forget to remove comments.

## Behavior

There's also several env variables and CLI args that slightly change some aspects of the bot behavior, mainly oriented towards server-side.

> [!IMPORTANT]
> This section needs documentation, though CLI arg are accessible through `bun start -h`

<!--
| Example           | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `BOT_ID`=id       | Denotes the Discord bot's unique identification.                   |
| `DEBUG`=boolean   | Specifies whether debugging mode is enabled or not.                |
| `DEVELOPER_ID`=id | The id the bot will reference to as the Developer.                 |
| `ENV`=path        | Defines the path to the .env file.                                 |
| `GUILD_ID`=id     | Signifies the Guild ID on Discord where the commands will be sent. |
| `TOKEN`=token     | Represents the token of the Discord bot.                           |
-->

## Usage

Running the bot is as simple as being in its root directory and running: `bun start`

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
