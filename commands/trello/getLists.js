import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { Trello } from '../../Trello.js';


async function execute(interaction, client, embedTitle, returnids) {
    if(!interaction.deferred) await interaction.deferReply();
    let idBoolean;
    if (interaction.options && interaction.options.data.length && !returnids){    
        idBoolean = interaction.options.getBoolean('returnids');
    } else if (returnids) {
        idBoolean = true;
    }
    

    const trello = new Trello();
    const response = await trello.getLists();

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
    } 

    return command;
}

export { create }