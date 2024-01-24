import { SlashCommandBuilder } from '@discordjs/builders';
import 'dotenv/config';
import { MessageEmbed } from 'discord.js';
import { APICaller } from '../../APICaller.js';

async function execute(interaction) {
    await interaction.deferReply();
    const options = {
        method: 'GET',
        port: 443,
        hostname: 'api.wordnik.com',
        path: '/v4/words.json/wordOfTheDay',
        headers: {
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

    const wotdArray = await parse(response, interaction);

    const data = {
        title: "Word of the Day",
        description: "**__" + wotdArray.word + "__** (" + wotdArray.part + ")",
        color: 0x09aa03, // green
        footer: {
            icon_url: interaction.member.guild.me.user.avatarURL ? interaction.member.guild.me.user.avatarURL : "",
            text: interaction.member.guild.me.nickname ? interaction.member.guild.me.nickname : interaction.member.guild.me.displayName
        },
        fields: [
            {
                name: "Definition",
                value: wotdArray.def ? wotdArray.def : "<blank>"
            },
            {
                name: "Example",
                value: wotdArray.eg ? wotdArray.eg : "<blank>"
            },
            {
                name: "Origin",
                value: wotdArray.origin ? wotdArray.origin : "<blank>"
            }
        ]
    }

    const embed = new MessageEmbed(data);

    interaction.editReply({
        embeds: [embed],
        ephemeral: false,
    });
}

async function parse(body, interaction){
    let word = body.word;
    let part;
    let def;
    let eg;
    let origin;
    if(body.word)
        word = body.word;
    else 
        word = "There is no word of the day today.";
    if(body.examples)
        eg = body.examples[0].text;
    else
        eg = "No example provided.";
    if(body.note)
        origin = body.note;
    else
        origin = "No origin provided.";
    if(body.definitions[0].partOfSpeech)
        part = body.definitions[0].partOfSpeech;
    else
        part = "No part of speech provided.";
    if(body.definitions[0].text)
        def = body.definitions[0].text;
    else
        def = "No definition provided.";

    const wotdArray = {word: word, part: part, def: def, eg: eg, origin: origin};
    return wotdArray;
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('wotd')
        .setDescription('Word of the Day')
    const command = {
        data: data,
        execute: execute
    } 
    
    return command;
}

export { create }
