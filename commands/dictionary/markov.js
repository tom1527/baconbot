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

//let msgs = fs.readFileSync("./kinglear.txt", 'utf8').split('\n');

async function execute(interaction) {
    let minScore, minWords, maxWords, maxTries, resScore, resRefs, stateSize;
    if (interaction.options && interaction.options.data.length){    
        minScore = interaction.options.getInteger('minscore');
        minWords = interaction.options.getInteger('minwords');
        resScore = interaction.options.getInteger('resscore');
        resRefs = interaction.options.getInteger('resrefs');
        /* if(interaction.replied === false) {
            await interaction.reply({content : "Error - at least one flag must be true if specified.", ephemeral: true});
        } */
    } 
    
    await interaction.deferReply();

    const scoreFilter = resScore ? resScore : 100;
    const refsFilter = resRefs ? resRefs : 10
     
    const minWordsOption = minWords ? minWords : 10;
    const maxWordsOption = maxWords ? maxWords : 15; 

    const options = {
        minScore: minScore ? minScore : 100,
        maxTries: maxTries ? maxTries : 100000, 
        filter: res => { return (res.score >= scoreFilter) && (_.size(res.refs) >= refsFilter && res.string.split(" ").length >= minWordsOption && res.string.split(" ").length <= maxWordsOption);}}; // Properties of markov chain // This is how to check length: && res.string.split(" ").length >= minWords && res.string.split(" ").length <= maxWords
        
    const markov = new Markov.default({stateSize: stateSize ? stateSize : 1});
    markov.addData(msgs);

    // markov.buildCorpus();
    let result;
    try {
        result = markov.generate(options);
    } catch (error) {
        console.log(error);
        await interaction.deleteReply();
        await interaction.followUp({ content: error.message, ephemeral: true });
        // await interaction.editReply({ content: error.message, ephemeral: true });
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
            .setDescription('The minimum score a result can have. Default: 100'))
        .addIntegerOption(option =>
            option
            .setName('minwords')
            .setDescription('Minimum words in a string. Default: 10'))
        .addIntegerOption(option =>
            option
            .setName('resscore')
            .setDescription('The amount of score to filter the result by. Default: 100'))
        .addIntegerOption(option =>
            option
            .setName('resrefs')
            .setDescription('The number of messages used to build the string. Default: 10'));
    const command = {
        data: data,
        execute: execute
    } 

return command;
}

export { create }
