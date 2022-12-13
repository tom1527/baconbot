import { SlashCommandBuilder } from '@discordjs/builders';
import { Trello } from '../../Trello.js';

async function execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    let cardName;
    let cardDesc;
    let listName;
    let listId;
    let status;
    let cardInfo;
    if (!(interaction.options && interaction.options.data.length)){    
        interaction.editReply('Error, card name must be specified');
    } else {
        cardName = interaction.options.getString('cardname');
        cardDesc = interaction.options.getString('cardDesc');
        listName = interaction.options.getString('listname');
        status = interaction.options.getString('status');
        if(!cardDesc && !listName && !status) {
            interaction.editReply({content: 'Error: at least one other property must be specified.', ephemeral: true});
            return;
        }

        const trello = new Trello();
        const closestCardInfo = await trello.getClosestCard(cardName);
        //todo: null exception handler

        if(listName) {
            const listInfo = await trello.getClosestList(listName);
            try {
                listId = listInfo[1];
            } catch (error) {
                interaction.editReply('Sorry, a list by that name was not found.');
                return;
            }
        }

        if(status) {
            if(status == "closed") {
                status = true;
            } else {
                status = false;
            }
        }

        console.log(closestCardInfo);
        if(closestCardInfo != null) {
            cardName = closestCardInfo[0];
            const cardId = closestCardInfo[1];
            cardInfo = {
                cardId: cardId,
                ...(cardName) && {cardName: cardName},
                ...(cardDesc) && {cardDesc: cardDesc},
                ...(listId) && {idList: listId},
                ...(status) && {closed: status}
            }
            console.log(cardInfo);
        } else {
            interaction.editReply('Sorry, a card by that name was not found.');
        }

        if(cardInfo) {
            const trello = new Trello();
            const response = await trello.updateCard(cardInfo);
            if(response == 200) {
                interaction.editReply({content: 'Card updated.', ephemeral: true});
            } else {
                interaction.editReply({content: 'Error, card could not be updated.', ephemeral: true});
            }
        }
    }
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('updatecard')
        .setDescription('Moves a card from one list to another on Trello')
        .addStringOption(option =>
            option
            .setName('cardname')
            .setDescription('Id of list to get cards from')
            .setRequired(true))
        .addStringOption(option =>
            option
            .setName('listname')
            .setDescription('Name of list to send card to'))
            // .setRequired(true))
        .addStringOption(option =>
            option
            .setName('status')
            .setDescription('Whether card is archived')
            .addChoices(
                { name: 'open', value: 'open' },
                { name: 'closed', value: 'closed' }
            ))
        /* .addStringOptions(option =>
            option
            .setName('status')
            .addChoices(
                { name: 'open', value: 'open' },
                { name: 'closed', value: 'closed' }
            )) */
    const command = {
        data: data,
        execute: execute
    } 
    
    return command;
}

export { create }