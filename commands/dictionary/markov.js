import { SlashCommandBuilder } from '@discordjs/builders';
// const Markov = require('markov-strings').default;
import Markov from 'markov-strings'
import _ from 'lodash';
import * as fs from 'fs';
import { CommandInteractionOptionResolver, MessageActionRow, MessageEmbed, MessageSelectMenu, Modal, TextInputComponent } from 'discord.js';
// const { Modal } = require('discord.js');

let filePath = "./msg.txt";
let sourceText = fs.readFileSync(filePath, 'utf8');

let msgs = sourceText.split('\n');

if(msgs[0] == '' || msgs[0] == '\n') {
    msgs.shift();
}


async function execute(interaction, userOptions) {
    
    if (interaction.options && interaction.options.data.length){
        if(interaction.options.data[0].value == true) {
            const modal = new Modal()
                .setCustomId('markovmodal')
                .setTitle('Markov Options')
            const minScoreField = new TextInputComponent()
                .setCustomId('minScore')
                .setLabel('Minimum Score')
                .setStyle('SHORT')
                .setPlaceholder('100')
            const maxWordsField = new TextInputComponent()
                .setCustomId('maxWords')
                .setLabel('Maximum words')
                .setStyle('SHORT')
                .setPlaceholder('15')
            const minWordsField = new TextInputComponent()
                .setCustomId('minWords')
                .setLabel('Minimum words')
                .setStyle('SHORT')
                .setPlaceholder('10')
            const maxTriesField = new TextInputComponent()
                .setCustomId('maxTries')
                .setLabel('Maximum Tries')
                .setStyle('SHORT')
                .setPlaceholder('100000')
    
            const firstActionRow = new MessageActionRow().addComponents(minScoreField);
            const secondActionRow = new MessageActionRow().addComponents(minWordsField);
            const thirdActionRow = new MessageActionRow().addComponents(maxWordsField);
            const fourthActionRow = new MessageActionRow().addComponents(maxTriesField);
            const components = []
            components.push(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
    
            modal.addComponents(components);
            await interaction.showModal(modal);
        }
    } else {
        await interaction.deferReply();

        userOptions = userOptions ? userOptions : null
        console.log(userOptions);

        const options = {
            minScore: userOptions ? userOptions[0] : 100, 
            maxWords: userOptions ? userOptions[1] : 15, 
            minWords: userOptions ? userOptions[2] : 10, 
            maxTries: userOptions ? userOptions[3] : 100000, 
            filter: res => { return (res.score >= 100) && (_.size(res.refs) >= 10);}}; // Properties of markov chain
            console.log(options);
        const markov = new Markov.default({stateSize: 1});
        markov.addData(msgs);

        // markov.buildCorpus();
        let result;
        try {
            result = markov.generate(options);
        } catch (error) {
            console.log(error);
            await interaction.editReply({ content: error.message, ephemeral: false });
            return
        }

        const embed = new MessageEmbed({
            color: 0x850000, // red
            description: result.string
        });

        await interaction.editReply({embeds: [embed]});
    }
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
