// const fs = require('node:fs');
import *  as fs from 'fs';
// const path = require('node:path');
import * as path from 'path';
import 'dotenv/config';
import {Client, Collection, Intents} from 'discord.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	
	var command = await import(`./commands/${file}`);
	var command = await command.create();
	(async () => {
		try {
			//client.commands.set(command.data.name, command);
			client.commands.set(command.data.name, command);
			console.log("Created commands");
		} catch (error) {
			console.log(error);
		}
	})();
}


client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	console.log(command);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
