#!/usr/bin/env node 
import *  as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import {Client, Collection, Intents } from 'discord.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as passiveCommands from './commands/bot/passiveCommands.js';
import * as msg from './commands/bot/msg.js';
import Glob from 'glob'
import webhook from './webhook.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';


const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES);

const client = new Client({ intents: myIntents });

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
		command = await command.create(client);
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

client.on('messageCreate', async (message) => {
	if(message.channel.id != "694914362095304771") { // blacklist code channel from collecting source data for !markov command
		msg.appendMessage(message);
	}
	if(message.content.substring(0, 1) == '!' && message.content.indexOf(' ', 1) == -1) {
		var name = message.author.id;
		message.channel.send(`@everyone <@${name}> is a fucking idiot`);
	}
	if(message.content == 'scrape me daddy') {
		let messages = [];
		let channels = Array.from(client.channels.cache);
		for (var channel of channels) {
			if(channel[1].id != "694914362095304771" && channel[1].type == 'GUILD_TEXT') {
				channel = channel[1];
			
				// Create message pointer
				let message = await channel.messages
					.fetch({ limit: 1 })
					.then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));
		
				while (message) {
					await channel.messages
					.fetch({ limit: 100, before: message.id })
					.then(messagePage => {
						messagePage.forEach((messageObj) =>  {
							messages.push(messageObj);
							msg.appendMessage(messageObj);
						});
		
						// Update our message pointer to be last message in page of messages
						message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
					})
				}
			}
		}


		console.log(messages);  // Print all messages
	}
});

let currentChannelID;
client.on('ready', async function(client){
	const guild = await client.guilds.fetch(guildID);
	currentChannelID = passiveCommands.getCurrentChannelID(guild, client);
	console.log('Ready!');
})

client.on('channelPinsUpdate', async function(channel, time){
    currentChannelID = channel.id;
    await passiveCommands.loadPins(channel.guild);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
	// Compare nickname as 'guildMemberUpdate' is triggered by any changes to user
	// Todo: investigate why this only seems to trigger on the second change
	if(newMember.nickname && oldMember.nickname !== newMember.nickname) {
		const quoteCommand = client.commands.get('quote');

		for(var option of quoteCommand.data.options) {
			if(option.name == 'user') {
				const members = newMember.guild.members.cache;
				// Reset choices for user option - can't compare nicknames as they may be out of sync
				// so it is better to start from scratch
				option.choices.length = 0;
				for(var member of members) {
					option.choices.push(
						{name: member[1].displayName, value: member[1].displayName}
					);
				}
			}
		}

		await passiveCommands.loadPins(newMember.guild);

		const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
		// rest.put(Routes.applicationCommands())

		const commands = rest.get(Routes.applicationCommands(process.env.APP_ID))
		.then(data => {
			const promises = [];
			for (const command of data) {
				console.log(command.name);
				console.log(command.id);
				if(command.name == 'quote') {
					promises.push(rest.patch(Routes.applicationCommand(process.env.APP_ID, command.id), { body: quoteCommand.data }));
				}
			}
			return Promise.all(promises).then(console.log(`Patching quote command...`));
		})
		.catch(console.error);

	}
})

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

webhook.setUpWebhook(client);
