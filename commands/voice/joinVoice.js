import { SlashCommandBuilder } from '@discordjs/builders';
import { joinVoiceChannel, createAudioPlayer, AudioResource, createAudioResource, StreamType, getVoiceConnection, generateDependencyReport, entersState, VoiceConnectionStatus, AudioPlayerStatus, EndBehaviorType  } from '@discordjs/voice';
import { Interaction, MessageAttachment, MessageEmbed } from 'discord.js';
import 'dotenv/config';
import *  as fs from 'fs';
import prism, { ogg } from 'prism-media';
import { pipeline } from 'stream';
import ffmpeg from 'ffmpeg';
import { APICaller } from '../../APICaller.js';


const audioPlayers = new Map();

async function execute(interaction) {
    let recordOption = interaction.options.get('record');
    let playOption = interaction.options.get('play');
    let transcribeOption = interaction.options.get('transcribe');

    if (!interaction.member.voice.channel && !transcribeOption) {
        interaction.reply({content: 'You need to be in a voice channel you dumbass', ephemeral: false});
        return;
    }
    if(!interaction.deferred) await interaction.deferReply();

    if (transcribeOption) {
        const userId = interaction.user.id;
        const filePath = `./${userId}.mp3`;
        const result = await transcribe(filePath);
        // console.log(result);
        interaction.editReply({content: `${result.text}`})
        return;
    }

    let connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    })

    entersState(connection, VoiceConnectionStatus.Ready, 5000).then(async () => {
        if (playOption) {
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
                console.log(connection.state)
                try {
                    connection.destroy();
                } catch (error) {
                    console.log(error);
                }
                audioPlayers.delete(interaction.guildId)
                console.log("done");
            })

        } else if (recordOption) {

            connection.receiver.speaking.on('start', (userId) => {
                const opusStream = connection.receiver.subscribe(userId, {
                    end: {
                        behavior: EndBehaviorType.AfterSilence,
                        duration: 100,
                    },
                });

                const oggStream = new prism.opus.OggLogicalBitstream({
                    opusHead: new prism.opus.OpusHead({
                        channelCount: 2,
                        sampleRate: 48000,
                    }),
                    pageSizeControl: {
                        maxPackets: 10,
                    },
                });
            
                var rawAudioFilePath = `./${userId}.pcm`;
            
                const out = fs.createWriteStream(rawAudioFilePath, { flags: 'a' });
                console.log(`👂 Started recording ${rawAudioFilePath}`);
            
                pipeline(opusStream, oggStream, out, (error) => {
                    if (error) {
                        console.warn(`Error recording file ${rawAudioFilePath} - ${error.message}`);
                    } 
                });

                setTimeout(() => {
                    const process = new ffmpeg(rawAudioFilePath);
                    process.then((audio) => {
                        audio.fnExtractSoundToMP3(`./${userId}.mp3`, function (error, file) {
                            if(error) {
                                console.log(error);
                            } else {
                                fs.unlink(`${rawAudioFilePath}`, (error => {
                                    if (error) console.log(error);
                                }));
                                // interaction.editReply({content: `Now playing: hotcrossbuns.wav`});
                                const data = {
                                    color: 0xffaa33,
                                    fields: [
                                        {
                                            name: "Here's your fucking file.",
                                        }
                                    ],
                                    footer: {
                                        icon_url: interaction.member.guild.me.user.avatarURL ? interaction.member.guild.me.user.avatarURL : "",
                                        text: interaction.member.guild.me.nickname ? interaction.member.guild.me.nickname : interaction.member.guild.me.displayName
                                    }
                                }
                                const embed = new MessageEmbed(data);
                                interaction.editReply({
                                    embeds: [embed],
                                    files: [file],
                                    ephemeral: false,
                                  })
                                console.log("file", file);
                            }
                        })
                    });
                }, 5000)

            })

            // const audio = connection.receiver.createStream(interaction.member.user, { mode: 'pcm' });
            // console.log(audio);

            // audio.pipe(fs.createWriteStream('user_audio'));
          
        } else {
            interaction.editReply({content: `Pick an option you nimwit`});
        }
    });
}

async function transcribe(filePath) {
    return new Promise ((resolve, reject) => {
        var stream = fs.createReadStream(filePath);
        let chunks = []
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('end', async () => {
            const apiCaller = new APICaller();
            const options = {
                method: 'POST',
                hostname: 'api.wit.ai',
                path: '/dictation',
                body: Buffer.concat(chunks),
                headers: {
                    "Content-Type": "audio/mpeg",
                    // 'content-type': 'audio/raw;encoding=unsigned-integer;bits=16;rate=8000;endian=big',
                    "Authorization": `Bearer ${process.env.wit_ai_token}`,
                }
            }
            // const data = await fs.createReadStream("./new-sound.mp3");
            const data = Buffer.concat(chunks);
            try {
                var result = await apiCaller.makeApiCall(options, data);
                result = result.replaceAll(/\n/g, '');
                result = result.replace(/'/g, '"');
                result = result.split('\r');
                 
                const processedResult = JSON.parse(result[result.length - 1]);
                resolve(processedResult);
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    });
}

async function create() {
    var data = new SlashCommandBuilder()
        .setName('joinvoice')
        .setDescription('Asks BaconBot to join a voice channel')
        .addBooleanOption(option =>
            option
            .setName('record')
            .setDescription('Records sound.')
        )
        .addBooleanOption(option =>
            option
            .setName('play')
            .setDescription('Play sound.')
        )
        .addBooleanOption(option => 
            option
            .setName('transcribe')
            .setDescription('Transcribes your latest recording')
        )
    const command = {
        data: data,
        execute, execute
    }
    return command;
}

export { create }
