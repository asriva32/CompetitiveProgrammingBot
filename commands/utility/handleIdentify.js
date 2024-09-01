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
		const userID = interaction.user.id;
		// check if there is already a handle connected to the discord user
		// check if handle exists in codeforces database
		// then check if handle is already used by someone else
		const url = 'https://codeforces.com/api/problemset.problems';
		let problemUrl = '';
		try{
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			let data = await response.json();
			if(data.status !== "OK"){
				await interaction.reply('Codeforces api is down');
				return;
			}
			let Problems = data.result.problems;
			let len = Problems.length;
			let index = Math.floor(Math.random() * len);
			console.log( Problems[index].contestId);
			problemUrl = 'https://codeforces.com/problemset/problem/' + Problems[index].contestId + '/' + Problems[index].index;
		} catch (error) {
			console.error(error.message);
			return;
		}
		await interaction.reply('Submit a complile error to ' + problemUrl + ' within 60 seconds');
		await new Promise(resolve => setTimeout(resolve, 60000));

	},
};