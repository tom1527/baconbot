import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import 'dotenv/config';
import { APICaller } from '../../APICaller.js';


async function execute(interaction, client, embedTitle, returnids) {
    if(!interaction.deferred) await interaction.deferReply();
    let idBoolean;
    if (interaction.options && interaction.options.data.length && !returnids){    
        idBoolean = interaction.options.getBoolean('returnids');
    } else if (returnids) {
        idBoolean = true;
    }
    
    const response = await listsAPICall();

    let fields = [];
    for(let i = 0; i < response.length; i++) {
        fields.push({
            name: response[i].name,
            ...(idBoolean) && {value: `ID: ${response[i].id}`},
            ...(!idBoolean) && {value: "\u200b"},
        })
    }

    const data = {
        title: embedTitle ? embedTitle : "Lists for the BaconBot Board",
        fields: fields
    }
    const embed = new MessageEmbed(data);
    interaction.editReply({
        embeds: [embed],
        ephemeral: true,
    });
}

async function listsAPICall() {
    const boardId = "62756d312de50469a3faaf36";
    const options = {
        method: "GET",
        port: 443,
        hostname: "api.trello.com",
        path: `/1/boards/${boardId}/lists?key=${process.env.trello_key}&token=${process.env.trello_token}`,
    }
    const apiCaller = new APICaller();
    const rawResponse = await apiCaller.makeApiCall(options);
    var response = "";
    try {
        response = JSON.parse(rawResponse);
        return response;
    } catch (error) {
        console.log(error)
    }
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('getlists')
        .setDescription('Returns all available lists from a Trello board.')
        .addBooleanOption(option =>
            option
            .setName('returnids')
            .setDescription('Specifies whether ids should also be returned'))
        
    const command = {
        data: data,
        execute: execute,
        listsAPICall: listsAPICall
    } 

    return command;
}

export { create }