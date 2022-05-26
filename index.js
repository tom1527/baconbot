#!/usr/bin/env node 
import *  as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import {Client, Collection, Intents} from 'discord.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as passiveCommands from './commands/bot/passiveCommands.js';
import * as msg from './commands/bot/msg.js';
import Glob from 'glob'
const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const guildID = process.env.GUILD_ID;
client.commands = new Collection();
const commandGlob = Glob.sync('commands' + '/**/*');
const commandFiles = commandGlob.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	if (file.includes('commands/bot/')) {
		continue;
	}
	var command = await import(`./${file}`);
	try {
		command = await command.create();
	} catch (error) {
		console.log(error);
	}
	(async () => {
		try {
			client.commands.set(command.data.name, command);
			console.log(`Created ${command.data.name}`);
		} catch (error) {
			console.log(error);
		}
	})();
}


client.once('ready', () => {
	console.log('Ready!');
});

client.on('messageCreate', (message) => {
	if(message.channel.id != "694914362095304771") { // blacklist code channel from collecting source data for !markov command
		msg.appendMessage(message);
	}
});

let currentChannelID;
client.on('ready', async function(client){
	const guild = await client.guilds.fetch(guildID);
	currentChannelID = passiveCommands.getCurrentChannelID(guild, client);
})

client.on('channelPinsUpdate', async function(channel, time){
    currentChannelID = channel.id;
    await passiveCommands.loadPins(channel);
});

client.on('interactionCreate', async interaction => {
	if (interaction.isModalSubmit()) {
		if(interaction.customId == 'suggestionModal') {
			const command = client.commands.get('suggest')
			await command.execute(interaction, client);
		}
	}

	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);	

	if (!command) return;

	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		try {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: false });
		}	catch (error) {
			if (error.code === 'INTERACTION_ALREADY_REPLIED') {
				await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: false });
			} else {
				console.log(error);
			}
		}
	}
});

client.login(process.env.DISCORD_TOKEN);
