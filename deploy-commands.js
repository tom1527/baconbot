import fs from 'node:fs';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import 'dotenv/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { SlashCommandBuilder } from '@discordjs/builders';
import Glob from 'glob'

const commandGlob = Glob.sync('commands' + '/**/*');
const commandFiles = commandGlob.filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
	const command = await import(`./${file}`);
	try { 
		const commandObject = await command.create();
		commands.push(commandObject.data);
	} catch (error) {
		console.log(error);
	}
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationCommands(process.env.APP_ID,  process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
	