const { SlashCommandBuilder, InviteTargetType } = require('discord.js');
const mongoFunctions = require('/Users/arnavsrivastava/Desktop/CompetitiveProgrammingBot/functions');



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
		const userID = interaction.user.id.toString();
		// check if userID already exists
		let res = await mongoFunctions.getHandle(userID);
		if(res){
			await interaction.reply('You are already connected!');
			return;
		}
		const handleURL = `https://codeforces.com/api/user.info?handles=${handle}&checkHistoricHandles=false`;
		// check if handle exists
		res = await mongoFunctions.checkCodeforcesHandle(handleURL);
		if(!res){
			await interaction.reply('This handle does not exist!');
			return;
		}
		// check if handle is already in use
		res = await mongoFunctions.getUser(handle)
		if(res){
			await interaction.reply('This handle is already in use by another user!');
			return;
		}
		let url = 'https://codeforces.com/api/problemset.problems';
		let problemUrl = '';
		let problemSelected;
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
			problemSelected = Problems[index];
			console.log( Problems[index].contestId);
			problemUrl = 'https://codeforces.com/problemset/problem/' + Problems[index].contestId + '/' + Problems[index].index;
		} catch (error) {
			console.error(error.message);
			return;
		}
		await interaction.reply('Submit a complile error to ' + problemUrl + ' within 60 seconds');
		await new Promise(resolve => setTimeout(resolve, 60000));
		console.log('HERE!');
		// look at submission history and check if compile error was submitted
		try{
			url = `https://codeforces.com/api/user.status?handle=${handle}&count=10`
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			let data = await response.json();
			if(data.status !== "OK"){
				await interaction.followUp('Codeforces api is down');
				return;
			}
			let Submissions = data.result;
			let found = false;
			for(let i = 0; i < Submissions.length;i++){
				if(Submissions[i].verdict === "COMPILATION_ERROR" && Submissions[i].problem.contestId === problemSelected.contestId && Submissions[i].problem.index === problemSelected.index){
					console.log(Submissions[i].problem);
					found = true;
					break;
				}
			}
			if(found){
				mongoFunctions.addHandle(userID, handle);
				await interaction.followUp('Codeforces handle connected!');
			}else{
				await interaction.followUp('No submission found for problem');
			}
		} catch(error){
			console.error(error.message);
			return;
		}
	},
};