import { SlashCommandBuilder } from '@discordjs/builders';
import 'dotenv/config';
import { MessageEmbed } from 'discord.js';
import { APICaller } from '../../APICaller.js';

    function printCards(cards, listName, message) {
        var cardNames = [];
        for(let i = 0; i < cards.length; i++) {
            cardNames.push(cards[i].name);
        }
        var cardsList = cardNames.join("\n");
        message.channel.send(`Jobs on the ${listName} list: \n${cardsList}`);
    }

async function execute(interaction, client) {
    await interaction.deferReply();
    let listId;
    let listName;
    if (!(interaction.options && interaction.options.data.length)){    
        const command = client.commands.get('getlists');
        const embedTitle = "Please specify a list by name or ID from the following list:";
        const returnids = true
        command.execute(interaction, undefined, embedTitle, returnids); 
    } else {
        listId = interaction.options.getString('listid');
        listName = interaction.options.getString('listname')  

        const command = client.commands.get('getlists');
        const lists = await command.listsAPICall();
        if(listId) {
            for(let i = 0; i < lists.length; i++) {
                if(listId == lists[i].id) {
                    listName = lists[i].name
                }
            }
        } else if(listName) {
            const listInfo = await getClosestList(listName, lists);
            if(listInfo) {
                listName = listInfo[0];
                listId = listInfo[1];
            } else {
                await interaction.editReply({content: 'Error: could not find list by that name.', ephemeral: true});
                return;
            }
        }
        
        const options = {
            method: "GET",
            port: 443,
            hostname: "api.trello.com",
            path: `/1/lists/${listId}/cards?key=${process.env.trello_key}&token=${process.env.trello_token}`,
        }
        const apiCaller = new APICaller();
        const rawResponse = await apiCaller.makeApiCall(options);
        var response = "";
        try {
            response = JSON.parse(rawResponse);
        } catch (error) {
            console.log(error);
            await interaction.editReply({content: 'Error: either no list was found or something else has gone wrong.', ephemeral: true});
            return;
        }

        const cardNames = []
        for(let i = 0; i < response.length; i++) {
            cardNames.push({
                name: response[i].name,
                value: "\u200b"
            })
        }

        const data = {
            title: `Cards from the list: '${listName}'`,
            fields: cardNames
        }
        const embed = new MessageEmbed(data);
        interaction.editReply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}

async function getClosestList(listName, lists) {
    var listNames = [];
    let bestMatch = null;
    let bestMatchId = null
    let bestDistance = 9999;
    for(let i = 0; i < lists.length; i++) {
        listNames.push(lists[i].name);
        const distance = await levenshteinDistance(listName.toLowerCase().trim(), lists[i].name.toLowerCase().trim());
        if (distance < bestDistance) {
            bestDistance = distance;
            bestMatch = lists[i].name;
            bestMatchId = lists[i].id
        }
    }
    if(bestDistance < 3) {
        const listInfo = [bestMatch, bestMatchId];
        return listInfo;
    } else {
        return null;
    }
}

async function levenshteinDistance(a="", b="") {
    const al=a.length;
    const bl=b.length;
    if(!al) return bl; 	
    if(!bl) return al;
    const aa=[...a],
        ba=[...b];
    let i,j,matrix=[];
    for(i=0; i<=bl; ++i) matrix[i]=[i];
    const m0=matrix[0];
    for(j=0; j<=al; ++j) m0[j]=j;
    const alm1=al-1,blm1=bl-1;
    for(i=0; i<=blm1; ++i){
        for(j=0; j<=alm1; ++j){
            const mi=matrix[i],mi1=matrix[i+1];
            mi1[j+1]=aa[j]==ba[i]?
                mi[j]:
                Math.min(
                    mi[j]+1, // substitution
                    mi1[j]+1, // insertion
                    mi[j+1]+1 // deletion
                );
        }
    }
    return matrix[bl][al];
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('getcards')
        .setDescription('Gets cards from a specified Trello board')
        .addStringOption(option =>
            option
            .setName('listid')
            .setDescription('Id of list to get cards from'))
        .addStringOption(option =>
            option
            .setName('listname')
            .setDescription('Name of list to get cards from'))
    const command = {
        data: data,
        execute: execute
    } 
    
    return command;
}

export { create }