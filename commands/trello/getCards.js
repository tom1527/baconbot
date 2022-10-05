import { SlashCommandBuilder } from '@discordjs/builders';
import 'dotenv/config';
import { MessageEmbed } from 'discord.js';
import { APICaller } from '../../APICaller.js';
import { Trello } from '../../Trello.js';

async function execute(interaction, client) {
    if(!interaction.deferred) await interaction.deferReply();
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

        const trello = new Trello();
        const lists = await trello.getLists();
        
        if(listId) {
            for(let i = 0; i < lists.length; i++) {
                if(listId == lists[i].id) {
                    listName = lists[i].name
                }
            }
        } else if(listName) {
            const listInfo = await trello.getClosestList(listName, lists);
            if(listInfo) {
                listName = listInfo[0];
                listId = listInfo[1];
            } else {
                // await interaction.editReply({content: 'Error: could not find list by that name.', ephemeral: true});
                await interaction.deleteReply();
                await interaction.followUp({content: 'Error: could not find list by that name.', ephemeral: true});
                return;
            }
        }
        
        const options = {
            method: "GET",
            port: 443,
            hostname: "api.trello.com",
            path: `/1/lists/${listId}/cards?key=${process.env.trello_key}&token=${process.env.trello_token}`,
        }
        
        const cards = await trello.getCards(options);

        const cardNames = []
        for(var card in cards) {
            cardNames.push({
                name: cards[card].cardName,
                value: cards[card].desc ? cards[card].desc : "\u200b"
            })
        }

        const data = {
            title: `Cards from the list: '${listName}'`,
            fields: cardNames
        }
        const embed = new MessageEmbed(data);
        await interaction.deleteReply();
        await interaction.followUp({
            embeds: [embed],
            // ephemeral: true,
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