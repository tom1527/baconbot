import { SlashCommandBuilder } from '@discordjs/builders';
import 'discord.js';
import { MessageEmbed } from 'discord.js';
import { APICaller } from '../../APICaller.js';
      
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


    const data = {
        color: 0xff22ec, // turquoise
        title: "Mission statement:",
        description: response.phrase,
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
