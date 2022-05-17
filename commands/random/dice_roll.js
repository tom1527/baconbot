import { SlashCommandBuilder } from '@discordjs/builders';

const execute = async function execute(interaction) {
    var sides = 6;
    if (interaction.options.data[0].name == "max") {
        sides = interaction.options.data[0].value;
    } 
    var roll = Math.floor(Math.random() * sides) + 1;
	interaction.reply({
		content: "You rolled a " + roll,
		ephemeral: false,
	});
}

async function create() {
	const data = new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls a die.')
        .addIntegerOption(option =>
            option.setName('max')
                .setDescription('The number of sides to the dice')
                .setRequired(false));
	const command = {
		data: data,
		execute: execute
	}
	return command;
}

export { create };
