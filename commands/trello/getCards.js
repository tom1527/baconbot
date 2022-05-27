import { SlashCommandBuilder } from '@discordjs/builders';
import 'dotenv/config';
import { MessageEmbed } from 'discord.js';
import { APICaller } from '../../APICaller.js';
import { Trello } from '../../Trello.js';

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
            const trello = new Trello;
            const listInfo = await trello.getClosestList(listName, lists);
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