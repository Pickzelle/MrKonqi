import { SlashCommandBuilder } from 'discord.js'

import type schema from './schema'

export default {
	data: new SlashCommandBuilder()
		.setName('newarch')
		.setDescription(
			'Performs a search in the Arch package database for packages',
		)
		.addStringOption((option) =>
			option
				.setName('package')
				.setDescription("The package you're searching for")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('repository')
				.setDescription('Which repository to fetch from')
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
				.setDescription(
					'Whether or not to show dependencies for the given package',
				),
		)
		.addBooleanOption((option) =>
			option
				.setName('ephemeral')
				.setDescription(
					'Toggles whether or not this message should be ephemeral',
				),
		),

	async execute(_BOT, _DB, _STORE, _CONFIG, interaction) {
		await interaction.reply('command not implemented')
	},
} as schema
