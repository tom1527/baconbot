import { SlashCommandBuilder } from '@discordjs/builders';
import 'dotenv/config';
import { MessageEmbed } from 'discord.js';
import { APICaller } from '../../APICaller.js';

async function execute(interaction) {
    await interaction.deferReply();
    var word = "";
    if (interaction.options.data[0] && interaction.options.data[0].value){
        word = interaction.options.data[0].value;
    } else {
        interaction.editReply('Error: word not specified');
    }
    const options = {
        method: 'GET',
        port: 443,
        hostname: 'api.wordnik.com',
        path: `/v4/word.json/${word}/relatedWords`,
        headers: {
            useCanonical: false,
            limitPerRelationshipType: 100,
            api_key: process.env.wordnik_key,
        }
    }
    const apiCaller = new APICaller();
    const rawResponse = await apiCaller.makeApiCall(options);
    var response = "";
    try {
        response = JSON.parse(rawResponse);
    } catch (error) {
        console.log(error)
    }

    let syn = "";

    for(let i = 0; i < response.length; i++){
        if(response[i].relationshipType == 'synonym') {
            syn = response[i].words;
            break;
        }
    }
    
    syn = shuffle(syn);
    syn = syn.slice(0, 10);
    let synstr = syn.toString();
    synstr = synstr.replace(/,/g, ", ");

    var data = {};
    if(syn == ""){
        data = {
            color: 0xffaa33,
            description: `Could not find synonyms for the word *${word}*`,
            footer: {
                icon_url: interaction.member.guild.me.user.avatarURL ? interaction.member.guild.me.user.avatarURL : "",
                text: interaction.member.guild.me.nickname ? interaction.member.guild.me.nickname : interaction.member.guild.me.displayName
            }
        }
    } else{
       data = {
            color: 0xffaa33,
            fields: [
                {
                    name: "Synonyms for *" + word + "*",
                    value: synstr
                }
            ],
            footer: {
                icon_url: interaction.member.guild.me.user.avatarURL ? interaction.member.guild.me.user.avatarURL : "",
                text: interaction.member.guild.me.nickname ? interaction.member.guild.me.nickname : interaction.member.guild.me.displayName
            }
        };
    }

    const embed = new MessageEmbed(data);

    interaction.editReply({
        embeds: [embed],
        ephemeral: false,
    });
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
    
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    
    return array;
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('synonym')
        .setDescription('Lists synonyms for the provided word')
        .addStringOption(option =>
            option
            .setName('word')
            .setDescription('Word to find synonyms for')
            .setRequired(true)
        )
    const command = {
        data: data,
        execute: execute
    } 

return command;
}

export { create }
