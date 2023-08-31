module.exports = {
	name: 'bugReport',

	async execute(bot, interaction) {

		const TITLE = interaction.fields.getTextInputValue('title');
		const DESCRIPTION = interaction.fields.getTextInputValue('description');
		const SEVERITY = interaction.fields.getTextInputValue('severity');
		
		console.log({ 
			TITLE,
			DESCRIPTION,
			SEVERITY
		});

		await interaction.reply({ content: 'Your bug report has been shared with the developer. Thanks for making me better!', ephemeral: true } );

	}
}
