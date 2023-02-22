import { SlashCommandBuilder } from '@discordjs/builders';
import 'discord.js';
import { MessageEmbed } from 'discord.js';
import { APICaller } from '../../APICaller.js';
import 'dotenv/config';
      
const execute = async function execute(interaction) {
    await interaction.deferReply();
    const options = {
        method: 'GET',
        hostname: 'corporatebs-generator.sameerkumar.website',
        path: ''
    }

    const apiCaller = new APICaller();
    const rawResponse = await apiCaller.makeApiCall(options);
    var response = "";
    try {
        response = JSON.parse(rawResponse);
    } catch (error) {
        console.log(error)
    }

    const phrase = response.phrase;

    const imageOptions = {
        method: 'GET',
        hostname: 'serpapi.com',
        path: `/search.json?q=business%20people&tbm=isch&ijn=0&api_key=${process.env.serpapi}`
    }

    const imageRawResponse = await apiCaller.makeApiCall(imageOptions);
    var imageResponse = "";
    try {
        imageResponse = JSON.parse(imageRawResponse);
    } catch (error) {
        console.log(error)
    }

    const image = imageResponse.images_results[Math.floor(Math.random() * imageResponse.images_results.length)].original;

    const data = {
        color: 0xff22ec, // turquoise
        title: "Mission statement:",
        description: phrase,
        image: {
            url: image,
        },
        footer: {
            icon_url: interaction.member.guild.me.user.avatarURL ? interaction.member.guild.me.user.avatarURL : "",
            text: interaction.member.guild.me.nickname ? interaction.member.guild.me.nickname : interaction.member.guild.me.displayName
        }
    }
    
    const embed = new MessageEmbed(data);

    interaction.editReply({
		embeds: [embed],
		ephemeral: false,
	});
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('missionstatement')
        .setDescription('Generate a new mission statement for your business')
    const command = {
        data: data,
        execute: execute
    } 
    
    return command;
}

export { create };
