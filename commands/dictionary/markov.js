import { SlashCommandBuilder } from '@discordjs/builders';
// const Markov = require('markov-strings').default;
import Markov from 'markov-strings'
import _ from 'lodash';
import * as fs from 'fs';
import { CommandInteractionOptionResolver, Message, MessageActionRow, MessageEmbed, MessageSelectMenu, Modal, TextInputComponent } from 'discord.js';

async function execute(interaction) {
    await interaction.deferReply();
    let buildcorpus;
    let wordLimit;
    let maxTries;
    let stateSize
    if (interaction.options && interaction.options.data.length){    
        buildcorpus = interaction.options.getBoolean('buildcorpus');
        wordLimit = interaction.options.getInteger('wordlimit');
        maxTries = interaction.options.getInteger('maxtries')
        stateSize = interaction.options.getInteger('statesize')
    }

    let markovData;

    if(buildcorpus) {
        let sourceText = fs.readFileSync("./msg.txt", 'utf8');
        markovData = markovChainGenerator(sourceText, stateSize);
        fs.writeFileSync( "./markovChain.json", JSON.stringify(markovData) )
    } else {
        try {
            markovData = JSON.parse(fs.readFileSync("./markovChain.json", 'utf-8'));
        } catch (error) {
            console.log(error);
            await interaction.editReply("Could not build a corpus! Try running with the build corpus option set to true.");        
            return;
        }
    }

    if(!stateSize) {
        const markovChainKeys = Object.keys(markovData.markovChain);
        const markovChainKeyArray = markovChainKeys[0].split(' ');
        stateSize = markovChainKeyArray.length;
    }

    const userOptions = {
        wordLimit: wordLimit ? wordLimit : 10,
        maxTries: maxTries ? maxTries : 10,
        stateSize: stateSize ? stateSize : 2
    }

    let markovString;
    for ( let i = 0; i < userOptions.maxTries; i++) {
        markovString = getMarkovString(markovData, userOptions);
        if(markovString != undefined) {
            break;
        }
    }
    
    const embed = new MessageEmbed({
        color: 0x850000, // red
        description: markovString ? markovString : "Failed to generate string"
    });
    await interaction.editReply({embeds: [embed]});
}

function markovChainGenerator(text, stateSize) {
    const markovData = {
        markovChain: {},
        startWords: [],
        endWords: []
    }

    const zip = (a, b) => Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);

    const messagesArray = text.split('\n');
    messagesArray.forEach(message => {
        if(stateSize == 2) {
            const regex = /([^ ]+ [^ ]+)/g;
            var wordsArray = [];
            let staggeredMessage;
            let staggeredArray = [];
            let finalArray = [];

            let matchAll = message.matchAll(regex);
            if (message.split(" ").length > 2) {
                staggeredMessage = message.trim().substring(message.indexOf(" ") + 1);
                for (const match of staggeredMessage.matchAll(regex)) {
                    staggeredArray.push(match[0]);
                }
            }

            for (const match of message.matchAll(regex)) {
                wordsArray.push(match[0]);
            }

            if (staggeredArray.length) {
                finalArray = [].concat(...zip(wordsArray, staggeredArray))
                if (finalArray[finalArray.length -1] == undefined) {
                    finalArray.pop();
                }
                wordsArray = finalArray;
            }

        } else {
            var wordsArray = message.split(' ')
        }
        if(wordsArray == null || wordsArray.length < 2) {
            return;
        }
        if(!markovData.startWords.includes(wordsArray[0])) {
            markovData.startWords.push(wordsArray[0]);
        }
        if(!markovData.endWords.includes(wordsArray[wordsArray.length -1])) {
            markovData.endWords.push(wordsArray[wordsArray.length -1])
        }
        for (let i = 0; i < wordsArray.length; i++) {
            // If the word is not already in the markovChain, add it
            let word = wordsArray[i]
            if (!markovData.markovChain[word]) {
                markovData.markovChain[word] = []
            }
            if (wordsArray[i + 1]) {
                markovData.markovChain[word].push(wordsArray[i + 1]);
            }
        }
    })

    return markovData
}

function getMarkovString(markovData, userOptions) {
    // const wordLimit = userOptions.wordLimit;
    const startWord = markovData.startWords[Math.floor(Math.random() * markovData.startWords.length)]

    let word = startWord;
    let result = '';

    // let word = markovData.markovChain[startWord][Math.floor(Math.random() * markovData.markovChain[startWord].length)]
    for (let i = 0; i < markovData.endWords.length; i++) {
        if (userOptions.stateSize == 2 && i > 0) {
            let wordS2 = word.substring(word.indexOf(" ") + 1);
            result += wordS2 + ' ';
        } else {
            result += word + ' ';
        }
        if(markovData.endWords.includes(word) && i >= userOptions.wordLimit) {
            return result;
        }
        console.log(word);
        var newWord = markovData.markovChain[word][Math.floor(Math.random() * markovData.markovChain[word].length)]
        word = newWord;
        if(!word || !markovData.markovChain.hasOwnProperty(word)) {
            break;
        }
    }

    console.log(result);
    return null;
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('markov')
        .setDescription('Generated an interesting message using a markov chain.')
        .addBooleanOption(option =>
            option
            .setName('buildcorpus')
            .setDescription('Builds the source from which we build markov strings'))
        .addIntegerOption(option => 
            option
            .setName('wordlimit')
            .setDescription('The number of words the sentence should be'))
        .addIntegerOption(option => 
            option
            .setName('maxtries')
            .setDescription('The number of attempts to make a sentence'))
        .addIntegerOption(option =>
            option
            .setName('statesize')
            .setDescription('How frequently a message is split (1 being every word).'));
    const command = {
        data: data,
        execute: execute
    } 

return command;
}

export { create }
