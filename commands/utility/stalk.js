const { SlashCommandBuilder, InviteTargetTyp, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoFunctions = require('/Users/arnavsrivastava/Desktop/Projects/CompetitiveProgrammingBot/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stalk')
        .setDescription('Display recently solved Codeforces problems'),
    async execute(interaction) {
        let currentPage = 0;
        const problemsPerPage = 10;
        let url = 'https://codeforces.com/api/problemset.problems';
        let username = await mongoFunctions.getHandle(interaction.user.id.toString());
        if(username === null){
            await interaction.reply('Please connect your account first!');
            return;
        }
        let entries = [];
        try{
            const response = await fetch(url);
            url = `https://codeforces.com/api/user.status?handle=${username}`;
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
                if(solved.size < 100 && entry.verdict == "OK"){
                    solved.add(entry);
                }
            }
            entries = Array.from(solved);

        } catch (error) {
			console.error(error.message);
			return;
		}
        console.log(entries.length);
        let problems = [];
        const currentTime = Math.floor(Date.now() / 1000);
        for (let entry of entries){
            const diff = currentTime - entry.creationTimeSeconds;
            problems.push({
                name: entry.problem.name, 
                rating: entry.problem.rating, 
                timediff: diff
            });
        }
        problems.sort(function(x, y) {
            return (x['timediff'] > y['timediff']) - (x['timediff'] < y['timediff']); 
        });
        
        for(let i = 0; i < problems.length;i++){
            const days = Math.floor(problems[i].timediff / (60 * 60 * 24));
            problems[i].timediff = days;
        }
        
        const generateEmbed = (page) => {
            const start = page * problemsPerPage;
            const end = start + problemsPerPage;
            const currentProblems = problems.slice(start, end);

            const description = currentProblems
                .map((p) => {
                    let timeAgo = `${p.timediff} days ago`; 
                    if (p.daysAgo === 0) {
                        timeAgo = 'today';
                    } else if (p.daysAgo === 1) {
                        timeAgo = 'yesterday';
                    }
                    return `${p.name} [${p.rating}]  (${timeAgo})`;
                })
                .join('\n');
            
            
            return new EmbedBuilder()
                .setTitle('Recently Solved Problems')
                .setDescription(description)
                .setFooter({ text: `Page ${page + 1} of ${Math.ceil(problems.length / problemsPerPage)}` });
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('⏪')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('⏩')
                .setStyle(ButtonStyle.Primary)
        );

        const message = await interaction.reply({
            embeds: [generateEmbed(currentPage)],
            components: [row],
            fetchReply: true,
        });

        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'prev' && currentPage > 0) {
                currentPage--;
            } else if (i.customId === 'next' && currentPage < Math.ceil(problems.length / problemsPerPage) - 1) {
                currentPage++;
            }
            await i.update({ embeds: [generateEmbed(currentPage)], components: [row] });
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] });
        });
        

    },
};