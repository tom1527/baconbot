/* import fs from 'node:fs';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import 'dotenv/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

var commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
	for (const file of commandFiles) {
		const command = await import(`./commands/${file}`);
		// const commandObject = await command.create();
		// commands.push(commandObject);
		commands.push(await command.create());
		console.log((commands));
	}

	try {
		await rest.put(Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID), { body: commands[0] });
		console.log('Successfully registered application commands.');
	} catch (error) {
		console.log(error);
	}
})();
 */

import fs from 'node:fs';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import 'dotenv/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { SlashCommandBuilder } from '@discordjs/builders';
const __dirname = dirname(fileURLToPath(import.meta.url));

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = await import(`./commands/${file}`);
	const commandObject = await command.create();
	commands.push(commandObject.data);
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.APP_ID,  process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);