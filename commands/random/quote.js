import { SlashCommandBuilder } from '@discordjs/builders';
import * as passiveCommands from '../bot/passiveCommands.js';
import { MessageEmbed } from 'discord.js';
import Discord from 'discord.js';
import * as fs from 'fs';

let filePath = "./pins.json";

const execute = async function execute(interaction) {
    let parseOption = interaction.options.get('loadpins');
    let yearOption = interaction.options.get('year');
    let userOption = interaction.options.get('user');

    if (parseOption && parseOption.value == true) {
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
        
        if(userOption && userOption.value) {
            pins = pins.filter(pin => pin.user.name == userOption.value);
        }

        if(yearOption && yearOption.value) {
            pins = pins.filter(pin => pin.date.substring(0,4) == yearOption.value);
        }


        var randMessage = pins[Math.floor(Math.random() * pins.length)];
        if(!randMessage) {
            interaction.reply("No pins could be found with those parameters.");
        }
        let date = new Date(randMessage.date).toDateString()
        if(isNaN(date)) {
            date = date.substring(4, date.length)
            date = date.substring(0, date.lastIndexOf(" ")) + "," + date.substring(date.lastIndexOf(" "), date.length); // Format date to Mmm DD, YYYY
        } else {
            date = null;
        }
        const data = {
            color: 0x139efb, // Lightish blue bar down the side
            author: {
                name: randMessage.user.name + (date ? ` - ${date}` : null), // Nickname of the author of the pinned message and date
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

async function addAdditionalQuoteOptions(data) {
    // const startYear = 2017;
    var currentYear = new Date().getFullYear();
    var yearChoices = [];
    for(var n = 2017; n <= currentYear; currentYear --) {
        yearChoices.push({name: currentYear.toString(), value: currentYear})
    }
    data.addIntegerOption(option =>
        option.setName('year')
        .setDescription('Year the quote will be from.')
        .addChoices(...yearChoices)
    )

    var users = [];
    var userChoices = [];
    let pins = await parsePins();
    for(var pin of pins) {
        if(pin.user.name && !users.includes(pin.user.name)) {
            users.push(pin.user.name);
            userChoices.push({name: pin.user.name, value: pin.user.name})
        }
    }

    data.addStringOption(option =>
        option.setName('user')
        .setDescription('Which comedian to source the funny from.')
        .addChoices(
            ...userChoices)
        )
    return data;
}

async function create() {
	var data = new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Returns a random pin.')
        .addBooleanOption(option =>
            option
            .setName('loadpins')
            .setDescription('Parses pins to update pin pool.')
        )
        data = await addAdditionalQuoteOptions(data);
	const command = {
		data: data,
		execute: execute
	}
	return command;
}

export { create };
