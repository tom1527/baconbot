const fs = require('node:fs');
const path = require('node:path');
import 'dotenv/config'
import {Client, Intents} from 'discord.js';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
	console.log('Ready!');
});

/* client.on('interactionCreate', async interaction => {
    console.log("test");
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}\nDate created: ${interaction.guild.createdAt}\nVerification level: ${interaction.guild.verificationLevel}`);
	} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	}
}); */

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
client.commands = new Collection();
