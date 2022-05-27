import { SlashCommandBuilder } from '@discordjs/builders';
import * as passiveCommands from '../bot/passiveCommands.js';
import { MessageEmbed } from 'discord.js';
import Discord from 'discord.js';
import * as fs from 'fs';

let filePath = "./pins.json";

const execute = async function execute(interaction) {
    if (interaction.options.data[0] && interaction.options.data[0].value == true) {
        await interaction.deferReply();
        const statusCode = await passiveCommands.loadPins(interaction.channel);
        console.log(statusCode);
        if (statusCode === 200) {
            await interaction.editReply('Pins loaded!');
        } else {
            await interaction.editReply('Error! Something went wrong.');
        }
    } else {
        let pins = await parsePins(interaction.guild_id);
        var randMessage = pins[Math.floor(Math.random() * pins.length)];
        const data = {
            color: 0x139efb, // Lightish blue bar down the side
            author: {
                name: randMessage.user.name, // Nickname of the author of the pinned message
                icon_url: randMessage.user.avatar // Avatar of the author of the pinned message
            },
            // If message has been deleted but pins haven't been reloaded, default behaviour is to jump anyway to the location of where the message was.
            description: randMessage.content + "\n\n" + "[Go to original](https://discordapp.com/channels/" + randMessage.guildID + "/" + randMessage.channelID + "/" + randMessage.id + ")" , // The content of the pinned message
            image: {
                url: randMessage.attach
            }
        }
        const embed = new MessageEmbed(data);
        try {
            interaction.reply({
                embeds: [embed],
                ephemeral: false,
            });
        } catch (error) {
            console.log(error);
            interaction.reply("There was an error. Please try \"!quote -l\"");
        }
        //await passiveCommands.loadPins(message.channel);
    }

    //message.channel.send("Be patient you turd.");

}

async function parsePins(){
    return new Promise ((resolve, reject) => {
        const pins = fs.readFile(filePath, 'utf8', async function(error, data){
            if(error) {
                reject(error);
                throw error;
            }
            resolve (JSON.parse(data));
        });
    });
}

async function create() {
	const data = new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Returns a random pin.')
        .addBooleanOption(option =>
            option
            .setName('loadpins')
            .setDescription('Parses pins to update pin pool.')
        )
	const command = {
		data: data,
		execute: execute
	}
	return command;
}

export { create };
