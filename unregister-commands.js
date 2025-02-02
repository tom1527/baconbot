import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import 'dotenv/config';

if (!process.env.APP_ID || !process.env.GUILD_ID || !process.env.DISCORD_TOKEN) {
	console.log('Environment variables missing, commands cannot be deployed.');
} else {
	const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

	rest.get(Routes.applicationGuildCommands(process.env.APP_ID,  process.env.GUILD_ID))
		.then(data => {
			const promises = [];
			for (const command of data) {
		    console.log(command.name);
		    console.log(command.id);
		    // const deleteUrl = `${Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID)}/${command.id}`;
			const deleteUrl = `${Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID)}/${command.id}`;
				promises.push(rest.delete(deleteUrl));
			}
			return Promise.all(promises).then(console.log(`Deleting ${promises.length} commands`));
		})
		.catch(console.error);
}
