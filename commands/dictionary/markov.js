import { SlashCommandBuilder } from '@discordjs/builders';
// const Markov = require('markov-strings').default;
import Markov from 'markov-strings'
import _ from 'lodash';
import * as fs from 'fs';
import { MessageActionRow, MessageEmbed, MessageSelectMenu, Modal, TextInputComponent } from 'discord.js';
// const { Modal } = require('discord.js');

let filePath = "./msg.txt";
let sourceText = fs.readFileSync(filePath, 'utf8');

let msgs = sourceText.split('\n');

if(msgs[0] == '' || msgs[0] == '\n') {
    msgs.shift();
}


async function execute(interaction) {
    
    if (interaction.options.data[0] && interaction.options.data[0].value == true){
        const modal = new Modal()
            .setCustomId('markovmodal')
            .setTitle('Markov Options')
        const minScoreField = new TextInputComponent()
            .setCustomId('minScore')
            .setLabel('Minimum Score')
            .setStyle('SHORT')
        const maxWordsField = new TextInputComponent()
            .setCustomId('maxWords')
            .setLabel('Maximum words')
            .setStyle('SHORT')
        const minWordsField = new TextInputComponent()
            .setCustomId('minWords')
            .setLabel('Minimum words')
            .setStyle('SHORT')
        const maxTriesField = new TextInputComponent()
            .setCustomId('maxTries')
            .setLabel('Maximum Tries')
            .setStyle('SHORT')
        const minScoreFilterField = new TextInputComponent()
            .setCustomId('minScoreFilter')
            .setLabel('Minimum Score Filter')
            .setStyle('SHORT')
        const minStringsField = new TextInputComponent()
            .setCustomId('minStrings')
            .setLabel('Minimum Messages')
            .setStyle('SHORT')
        const option1 = {
            label: "1",
            value: '1',
            description: "Numbger of words for each \"link\"."
        }
        const option2 = {
            label: "2",
            value: '2',
            description: "Numbger of words for each \"link\"."
        }
        const option3 = {
            label: "3",
            value: '3',
            description: "Numbger of words for each \"link\"."
        }
        const stateSizeField = new MessageSelectMenu()
            .setCustomId('stateSize')
            .setPlaceholder('State Size')
            .setMaxValues(1)
            .addOptions(option1, option2, option3)

        const firstActionRow = new MessageActionRow().addComponents(minScoreField);
        const secondActionRow = new MessageActionRow().addComponents(minWordsField);
        const thirdActionRow = new MessageActionRow().addComponents(maxWordsField);
        const fourthActionRow = new MessageActionRow().addComponents(maxTriesField);
        const fithActionRow = new MessageActionRow().addComponents(minScoreFilterField);
        // const sixthActionRow = new MessageActionRow().addComponents(minStringsField);
        // const seventhActionRow = new MessageActionRow().addComponents(stateSizeField);
        const components = []
        components.push(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fithActionRow);

        modal.addComponents(components);
        await interaction.showModal(modal);
    } else {
        await interaction.deferReply();
    }
    const options = {
        minScore: 100, 
        maxWords: 15, 
        minWords: 10, 
        maxTries: 100000, 
        filter: res => { return (res.score >= 100) && (_.size(res.refs) >= 10);}}; // Properties of markov chain

    const markov = new Markov.default({stateSize: 1});
    markov.addData(msgs);

    // markov.buildCorpus();
    
    const result = markov.generate(options);
    console.log(result);

    const embed = new MessageEmbed({
        color: 0x850000, // red
        description: result.string
    });

    interaction.editReply({embeds: [embed]});
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('markov')
        .setDescription('Generated an interesting message using a markov chain.')
        .addBooleanOption(option =>
            option
            .setName('setparameters')
            .setDescription('Choose parameters for Markov call - WARNING: setting these too high will kill baconbot'))
    const command = {
        data: data,
        execute: execute
    } 

return command;
}

export { create }
