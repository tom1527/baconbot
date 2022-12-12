import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import 'dotenv/config';
import Glob from 'glob'

const commandGlob = Glob.sync('commands' + '/**/*');
const commandFiles = commandGlob.filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
	if (file.includes('commands/bot/')) {
		continue;
	}
	const command = await import(`./${file}`);
	try { 
		const commandObject = await command.create();
		commands.push(commandObject.data);
	} catch (error) {
		console.log(error);
	}
}

if (!process.env.APP_ID || !process.env.GUILD_ID || !process.env.DISCORD_TOKEN) {
	console.log('Environment variables missing, commands cannot be deployed.');
} else {
	const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

	rest.put(Routes.applicationCommands(process.env.APP_ID,  process.env.GUILD_ID), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);	
}
