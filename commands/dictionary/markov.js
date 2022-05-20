import { SlashCommandBuilder } from '@discordjs/builders';
// const Markov = require('markov-strings').default;
import Markov from 'markov-strings'
import _ from 'lodash';
import * as fs from 'fs';
import { MessageEmbed } from 'discord.js';

let filePath = "./msg.txt";
let sourceText = fs.readFileSync(filePath, 'utf8');

let msgs = sourceText.split('\n');

if(msgs[0] == '' || msgs[0] == '\n') {
    msgs.shift();
}


async function execute(interaction) {
    await interaction.deferReply();
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
    const command = {
        data: data,
        execute: execute
    } 

return command;
}

export { create }
