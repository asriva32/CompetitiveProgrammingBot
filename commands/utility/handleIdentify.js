const { SlashCommandBuilder, InviteTargetType } = require('discord.js');
const mongoose = require('mongoose');
const Handle = require('/Users/arnavsrivastava/Desktop/CompetitiveProgrammingBot/models/handles');

async function findUserByDiscord(username){
	try {
		const user = await Handle.findOne({ user: username });
		if (user) {
			console.log('User exists:', user);
			return true;
		} else {
			console.log('User does not exist');
			return false;
		}
	} catch (error) {
		console.error('Error finding user by username:', error);
		throw error;
	}
}

async function findUserByHandle(handle) {
	try {
		const user = await Handle.findOne({ handle: handle });
		if (user) {
			console.log('User exists:', user);
			return true;
		} else {
			console.log('User does not exist');
			return false;
		}
	} catch (error) {
		console.error('Error finding user by handle:', error);
		throw error;
	}
}

async function checkCodeforcesHandle(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            console.log('Handle exists:', data.result[0]);
            return true;
        } else {
            console.log('Handle does not exist');
            return false;
        }
    } catch (error) {
        console.error('Error checking handle on Codeforces:', error);
        throw error;
    }
}

async function addHandle(userName, userHandle) {
    try {
        const newHandle = new Handle({
            user: userName,
            handle: userHandle
        });
        const savedHandle = await newHandle.save();
        console.log('Handle added:', savedHandle);
        return savedHandle;
    } catch (error) {
        console.error('Error adding handle to MongoDB:', error);
        throw error;
    }
}


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
		let res = await findUserByDiscord(userID);
		if(res){
			await interaction.reply('You are already connected!');
			return;
		}
		const handleURL = `https://codeforces.com/api/user.info?handles=${handle}&checkHistoricHandles=false`;
		// check if handle exists
		res = await checkCodeforcesHandle(handleURL);
		if(!res){
			await interaction.reply('This handle does not exist!');
			return;
		}
		// check if handle is already in use
		res = await findUserByHandle(handle)
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
				addHandle(userID, handle);
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