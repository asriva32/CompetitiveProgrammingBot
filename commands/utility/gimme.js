const { SlashCommandBuilder, InviteTargetType } = require('discord.js');
const mongoFunctions = require('/Users/arnavsrivastava/Desktop/CompetitiveProgrammingBot/functions');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('gimme')
		.setDescription('Recommends a problem of requested rating')
		.addStringOption(option => 
            option.setName('rating')
                .setDescription('The rating of the problem wanted')
                .setRequired(true)
		),
	async execute(interaction) {
        const Rating = parseInt(interaction.options.getString('rating'));
        let url = 'https://codeforces.com/api/problemset.problems';
        let res = await mongoFunctions.getHandle(interaction.user.id.toString());
        if(res === null){
            await interaction.reply('Please connect your account first!');
            return;
        }
        let problemSelected;
        let problemUrl;
        try{
			const response = await fetch(url);
            url = `https://codeforces.com/api/user.status?handle=${res}`;
            const user_response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			let data = await response.json();
            let user_data = await user_response.json();
			if(data.status !== "OK"){
				await interaction.reply('Codeforces api is down');
				return;
			}
            let Submissions = user_data.result;
            let solved = new Set();
            for(let entry of Submissions){
                if(entry.verdict == "OK"){
                    solved.add(entry.problem.name);
                }
            }
			let Problems = data.result.problems;
			
            let listOfRating = [];
            for(let Problem of Problems){
                if(Problem.rating == Rating){
                    // make sure user has not already solved this problem
                    if(!solved.has(Problem.name)){
                        listOfRating.push(Problem);
                    }
                }
            }
            
            let len = listOfRating.length;
            if(len == 0){
                await interaction.reply(`You have solved every ${Rating} rating problem!`);
                return;
            }
            console.log(len);
            let setOfProblems = new Set();
            while(setOfProblems.size < Math.min(len, 5)){
                let index = Math.floor(Math.random() * len);
                setOfProblems.add(listOfRating[index]);
            }
            let newest = -1;
            for(let Problem of setOfProblems){
                if(newest < Problem.contestId){
                    problemSelected = Problem;
                    newest = Problem.contestId;
                }
            }
            console.log(problemSelected)
            problemUrl = 'https://codeforces.com/problemset/problem/' + problemSelected.contestId + '/' + problemSelected.index;
		} catch (error) {
			console.error(error.message);
			return;
		}
        
        await interaction.reply(`Recommended problem for ${res}\n` + problemUrl);
    },
};