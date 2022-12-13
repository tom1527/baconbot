import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';

const execute = async function execute(interaction) {
    let mColl = await interaction.channel.messages.fetch({limit: 2});
    let mArray = await Array.from(mColl);
    let re = / /g;
    let str = "";
    let person;

    if(!mArray[0][1].author.bot){
        if(mArray[0][1].content.includes(" ")){
            str = await mArray[0][1].content.replace(re, " :clap: ");
            str = ":clap: " + str + " :clap:";
        }
        else str = ":clap: " + mArray[0][1].content + " :clap:";
    }
    else str = ":clap: fuck :clap: you :clap:"; 
    var name = "";
    if(mArray[0][1].member) {
       name = mArray[0][1].member.displayName; 
    } else {
        let member = await mArray[0][1].guild.members.fetch(mArray[0][1].author.id);
        name = member.displayName;
    }
    const data = {
        color: 0xd65d00,
        author: {
            name: name,
            icon_url: mArray[0][1].author.avatarURL()
        },
        description: str
    }
    const embed = new MessageEmbed(data)
    await interaction.reply({embeds: [embed]});
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('woke')
        .setDescription('Wokeifies the previous message.')
    const command = {
        data: data,
        execute: execute
    } 
    
    return command;
}

export { create }
