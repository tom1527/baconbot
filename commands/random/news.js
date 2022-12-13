import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { APICaller } from '../../APICaller.js';
      
const execute = async function execute(interaction) {
    await interaction.deferReply();
    const options = {
        method: 'GET',
        hostname: 'www.reddit.com',
        path: '/r/nottheonion.json?limit=100&raw_json=1'
    }

    const apiCaller = new APICaller();
    const rawResponse = await apiCaller.makeApiCall(options);
    var response = "";
    try {
        response = JSON.parse(rawResponse);
    } catch (error) {
        console.log(error)
    }
    let index = Math.floor((Math.random() * 50) + 1);
    let imageURL;

    if (response.data.children[index].data.preview) {
        imageURL = response.data.children[index].data.preview.images[0].source.url
    } else {
        imageURL = ""
    }

    const data = {
        color: 0x13c37a, // turquoise
        title: "Breaking News!",
        image: {
            url: imageURL
        },
        description: "[" + response.data.children[index].data.title + "]" + '(http://www.reddit.com' + response.data.children[index].data.permalink + ")",
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
        .setName('news')
        .setDescription('So much breaking news your screen will crack')
    const command = {
        data: data,
        execute: execute
    } 
    
    return command;
}

export { create };
