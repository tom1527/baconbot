import { SlashCommandBuilder } from '@discordjs/builders';
import { joinVoiceChannel, createAudioPlayer, AudioResource, createAudioResource, StreamType, getVoiceConnection, generateDependencyReport, entersState, VoiceConnectionStatus, AudioPlayerStatus } from '@discordjs/voice';
import 'dotenv/config';
import *  as fs from 'fs';

const audioPlayers = new Map();

console.log(generateDependencyReport());

async function execute(interaction) {
    if (!interaction.member.voice.channel) {
        interaction.reply({content: 'You need to be in a voice channel you dumbass', ephemeral: false});
        return;
    }
    if(!interaction.deferred) await interaction.deferReply();

    let connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    })

    entersState(connection, VoiceConnectionStatus.Ready, 5000).then(async () => {

        if (!audioPlayers.has(interaction.guildId)) {
			const player = createAudioPlayer();
			audioPlayers.set(interaction.guildId, player);
			connection.subscribe(player);
            console.log(player.state)
		}

        let resource = createAudioResource(await fs.createReadStream('./sound/wav/hotcrossbuns.wav'), {
            inlineVolume : true
        });

        resource.volume.setVolume(1);

        const player = audioPlayers.get(interaction.guildId);
        interaction.editReply({content: `Now playing: hotcrossbuns.wav`});

        await player.play(resource)

        player.on(AudioPlayerStatus.Idle, () => {
            connection.disconnect()
            console.log("done");
        })

    });
    
    


}



async function create(client) {
    var data = new SlashCommandBuilder()
        .setName('joinvoice')
        .setDescription('Asks BaconBot to join a voice channel')
    // data = await addAdditionalChannelOptions(data, client);
    const command = {
        data: data,
        execute, execute
    }
    return command;
}

export { create }
