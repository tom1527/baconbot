import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import 'dotenv/config';
import { APICaller } from '../../APICaller.js';

/* const key = auth.trello_key;
const token = auth.trello_token;
const baseUrl = "api.trello.com";
const boardId = "62756d312de50469a3faaf36";
const authParams = "?key=" + key + "&token=" + token;

class GetLists extends commando.Command {

    async run(message, args){
        if(args == "-id") {
            //todo: add param to also return ids alongside names
            returnListId = true;
        }
        let response = await GetLists.prototype.getListsRequest();
        var listNames = [];
        for(let i = 0; i < response.length; i++) {
            listNames.push(response[i].name);
        }
        var listsList = listNames.join("\n");
        message.channel.send(`The following lists are available: \n${listsList}`);
    }

    async getListsRequest(message, args) {
        return new Promise ((resolve, reject) => {
            const options = {
                hostname: baseUrl,
                method: 'GET',
                path: `/1/boards/${boardId}/lists/${authParams}`,
            }
    
        
        });
    }
} */

async function execute(interaction) {
    await interaction.deferReply();
    let idBoolean;
    if (interaction.options && interaction.options.data.length){    
        idBoolean = interaction.options.getBoolean('returnids');
    }
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
    } catch (error) {
        console.log(error)
    }
    
    let fields = [];
    for(let i = 0; i < response.length; i++) {
        fields.push({
            name: response[i].name,
            ...(idBoolean) && {value: `ID: ${response[i].id}`},
            ...(!idBoolean) && {value: "\u200b"},
        })
    }
    // var listsList = listNames.join("\n");
    const data = {
        title: "Lists for the BaconBot Board",
        fields: fields
    }
    const embed = new MessageEmbed(data);
    interaction.editReply({
        embeds: [embed],
        ephemeral: true,
    });
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
        execute: execute
    } 

return command;
}

export { create }