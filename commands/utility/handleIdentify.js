const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('handle-identify')
		.setDescription('Sets codeforces handle')
		.addStringOption(option => 
            option.setName('handle')
                .setDescription('The user handle to identify')
                .setRequired(true)
		),
	async execute(interaction) {
		const handle = interaction.options.getString('handle');
		await interaction.reply('Submit a complile error to');
	},
};