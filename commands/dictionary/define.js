import { SlashCommandBuilder } from '@discordjs/builders';
import 'dotenv/config';
import { MessageEmbed } from 'discord.js';
import { APICaller } from '../../APICaller.js';

async function execute(interaction, client) {
    await interaction.deferReply();
    var term = interaction.options.getString('term');
    term = term.replace(/ /g, "%20");

    const options = {
        method: 'GET',
        port: '443',
        hostname: 'api.urbandictionary.com',
        path: `/v0/define?term=${term}`,
    }

    const apiCaller = new APICaller();
    const rawResponse = await apiCaller.makeApiCall(options);
    var response = "";
    try {
        response = JSON.parse(rawResponse);
    } catch (error) {
        console.log(error)
    }

    const data = await processData(response);
    const embed = new MessageEmbed(data);

    interaction.editReply({
        embeds: [embed],
        ephemeral: false,
    })
}

async function processData(response){
    console.log(response);
    let definition = {}
    for(let i = 0; i < 9; i++){
        if(response.list[i]){
            let def = response.list[i].definition;
            if(def.length < 2000){
                def = def.replace(/\[/g, '');
                def = def.replace(/\]/g, '');

                let eg = response.list[i].example;
                if(eg){
                    eg = eg.replace(/\[/g, '');
                    eg = eg.replace(/\]/g, '');
                }
                definition = {
                    color: 0xfb72d,
                    title: response.list[i].word,
                    url: encodeURI(`https://www.urbandictionary.com/define.php?term=${response.list[0].word}`),
                    description: def,
                    ...(eg) && {fields: [{
                        name: "Example",
                        value: eg
                    }]}
                }
                break
            }
        } else {
            definition = {
                color: 0xfbf72d, // yellow
                title: "Word not found",
                description: "Please try a different word."
            }
        }
    }
    return definition
}


async function create() {
    const data = new SlashCommandBuilder()
        .setName('define')
        .setDescription('Get Urban Dictionary Definition')
        .addStringOption(option =>
            option
            .setName('term')
            .setDescription('The term to be defined')
            .setRequired(true));
    const command = {
        data: data,
        execute: execute
    } 
    
    return command;
}

export { create }
