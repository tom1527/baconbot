import { SlashCommandBuilder } from '@discordjs/builders';
import { APICaller } from '../../APICaller.js';
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js';
import { Trello } from '../../Trello.js';

async function execute(interaction, client) {
    if(interaction.type != 'MODAL_SUBMIT') {
        const modal = new Modal()
            .setCustomId('suggestionModal')
            .setTitle('Suggestion Details');
        const list = new TextInputComponent()
            .setCustomId('listname')
            .setPlaceholder('Suggestions')
            .setLabel("List")
            .setStyle('SHORT')
            .setRequired(true);
        const title = new TextInputComponent()
            .setCustomId('title')
            .setLabel("Title")
            .setStyle('SHORT')
            .setRequired(true);
        const desc = new TextInputComponent()
            .setCustomId('desc')
            .setLabel("Description")
            .setStyle('PARAGRAPH');
        const firstActionRow = new MessageActionRow().addComponents(list);
        const secondActionRow = new MessageActionRow().addComponents(title);
        const thirdActionRow = new MessageActionRow().addComponents(desc);
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
        await interaction.showModal(modal);
    } else {
        if(!interaction.deferred) await interaction.deferReply();
        const list = interaction.fields.getTextInputValue('listname');
        const title = interaction.fields.getTextInputValue('title');
        const desc = interaction.fields.getTextInputValue('desc');
    
        const trello = new Trello();
        const lists = await trello.getLists();
        const bestMatchListInfo = await trello.getClosestList(list, lists);
        
        if(!bestMatchListInfo) {
            await interaction.deleteReply()
            await interaction.followUp({content: 'Error: could not find list by that name.', ephemeral: true});
            return;
        }

        const data = JSON.stringify({
            "name": title,
            "desc": `${desc} \nSuggestion made by: ${interaction.member.displayName}`,
            "pos": "top",
            "idList": `${bestMatchListInfo[1]}`
        });

        const options = {
            hostname: 'api.trello.com',
            method: 'POST',
            port: 443,
            path: `/1/cards?key=${process.env.trello_key}&token=${process.env.trello_token}`,
            headers: {
                "Content-Type": "application/json",
                // "Content-Length": data.length,
                key: process.env.trello_key,
                token: process.env.trello_token
            }
        }

        const apiCaller = new APICaller();
        try {
            await apiCaller.makeApiCall(options, data);
            await interaction.deleteReply();
            await interaction.followUp({content: 'Suggestion made.', ephemeral: true});
        } catch (error) {
            await interaction.deleteReply();
            await interaction.followUp('Sorry, the suggestion could not be made due to an error.');
        }
    }
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Sends cards to Trello');
        
    const command = {
        data: data,
        execute: execute,
    } 

    return command;
}

export { create }
