import { SlashCommandBuilder } from '@discordjs/builders';
// const Markov = require('markov-strings').default;
import Markov from 'markov-strings'
import _ from 'lodash';
import * as fs from 'fs';
import { CommandInteractionOptionResolver, Message, MessageActionRow, MessageEmbed, MessageSelectMenu, Modal, TextInputComponent } from 'discord.js';
// const { Modal } = require('discord.js');

let filePath = "./msg.txt";
let sourceText = fs.readFileSync(filePath, 'utf8');

let msgs = sourceText.split('\n');

if(msgs[0] == '' || msgs[0] == '\n') {
    msgs.shift();
}

async function execute(interaction) {
    let minScore, minWords, maxWords, maxTries, resScore, resRefs, stateSize;
    if (interaction.options && interaction.options.data.length){    
        minScore = interaction.options.getInteger('minscore');
        minWords = interaction.options.getInteger('minwords');
        maxWords = interaction.options.getInteger('maxwords');
        maxTries = interaction.options.getInteger('maxtries');
        resScore = interaction.options.getInteger('resscore');
        resRefs = interaction.options.getInteger('resrefs');
        stateSize = interaction.options.getInteger('statesize');
        /* if(interaction.replied === false) {
            await interaction.reply({content : "Error - at least one flag must be true if specified.", ephemeral: true});
        } */
    } 
    console.log(minScore);
    await interaction.deferReply();

    const scoreFilter = resScore ? resScore : 100;
    const refsFilter = resRefs ? resRefs : 10

    const options = {
        minScore: minScore ? minScore : 100, 
        minWords: minWords ? minWords : 15, 
        maxWords: maxWords ? maxWords : 10, 
        maxTries: maxTries ? maxTries : 100000, 
        filter: res => { return (res.score >= scoreFilter) && (_.size(res.refs) >= refsFilter);}}; // Properties of markov chain
        
    const markov = new Markov.default({stateSize: stateSize ? stateSize : 1});
    markov.addData(msgs);

    // markov.buildCorpus();
    let result;
    try {
        result = markov.generate(options);
    } catch (error) {
        console.log(error);
        await interaction.editReply({ content: error.message, ephemeral: true });
        return
    }
    
    const embed = new MessageEmbed({
        color: 0x850000, // red
        description: result.string
    });
    await interaction.editReply({embeds: [embed]});
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('markov')
        .setDescription('Generated an interesting message using a markov chain.')
        .addIntegerOption(option =>
            option
            .setName('minscore')
            .setDescription('The minimum score a result can have.'))
        .addIntegerOption(option =>
            option
            .setName('minwords')
            .setDescription('Minimum words in a string'))
        .addIntegerOption(option =>
            option
            .setName('maxwords')
            .setDescription('Maximum words in a string'))
        .addIntegerOption(option =>
            option
            .setName('maxtries')
            .setDescription('Number of tries (limit to prevent crashing)'))
        .addIntegerOption(option =>
            option
            .setName('resscore')
            .setDescription('The amount of score to filter the result by'))
        .addIntegerOption(option =>
            option
            .setName('resrefs')
            .setDescription('The number of messages used to build the string'))
        .addIntegerOption(option =>
            option
            .setName('statesize')
            .setDescription('The number of words for each link'))
    const command = {
        data: data,
        execute: execute
    } 

return command;
}

export { create }
