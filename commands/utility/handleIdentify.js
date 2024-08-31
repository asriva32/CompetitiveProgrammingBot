const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('handle-identify')
		.setDescription('Sets codeforces handle'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};