import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import 'dotenv/config';

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.get(Routes.applicationCommands(process.env.APP_ID,  process.env.GUILD_ID))
	.then(data => {
		const promises = [];
		for (const command of data) {
            console.log(command.name);
            const deleteUrl = `${Routes.applicationCommands(process.env.APP_ID)}/${command.id}`;
			promises.push(rest.delete(deleteUrl));
		}
		return Promise.all(promises).then(console.log(`Deleting ${promises.length} commands`));
	})
	.catch(console.error);
