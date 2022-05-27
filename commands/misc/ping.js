import { SlashCommandBuilder } from '@discordjs/builders';

const execute = async function execute(interaction) {
	interaction.reply({
		content: 'Pong!',
		ephemeral: true,
	});
}

async function create() {
	const data = new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replys with Pong!')
	const command = {
		data: data,
		execute: execute
	}
	return command;
}

export { create };