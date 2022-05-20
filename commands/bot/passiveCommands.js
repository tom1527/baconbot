import Discord from 'discord.js';
import * as fs from 'fs';

// TODO: instead of just getting pins from channels and rewriting the file every time, parse the text file first and then compare JSONs and 
// if there's a difference, then rewrite

<<<<<<< HEAD
module.exports = {
    currentChannelID: function(guild){
        let latestChannel = 0;
        guild.channels.forEach(function(channel){
=======
    const currentChannelID = function(guild, client){
        let latestChannel = 0;
        /* guild.channels.cache.forEach(function(channel){
>>>>>>> refactor
            if(channel.type == 'text'){
                latestChannel = channel.id;
                if(channel.createdTimestamp > latestChannel.createdTimestamp) latestChannel = channel.id;
            }
<<<<<<< HEAD
        })
        return latestChannel;
    },

    loadPins: async function(channel){

        
        let pinsPath = __dirname + "/../../pins.json";
=======
        }) */
        let channels = Array.from(client.channels.cache);
        for (const channel of channels) {
            if(channel[1].type == 'GUILD_TEXT'){
                latestChannel = channel[0];
                if(channel.createdTimestamp > latestChannel.createdTimestamp) latestChannel = channel[0];
            }
        }
        return latestChannel;
    }

    const loadPins = async function(channel){
        
        let pinsPath = "./pins.json";
>>>>>>> refactor
        
        let channelMessages = new Discord.Collection();
        let messageCollection = new Discord.Collection();
        let guild = channel.guild;
        let messageArray = new Array();
        let objectArray = new Array();
        
<<<<<<< HEAD
        let iter = guild.channels[Symbol.iterator]();
        for(let i of iter){
            if(i[1].type == 'text'){
                console.log("Loading " + i[1].name + " channel...");

                if(i[1].permissionsFor(guild.me).hasPermission('VIEW_CHANNEL')){
                    channelMessages = await i[1].fetchPinnedMessages();
=======
        let iter = Array.from(guild.channels.cache)[Symbol.iterator]();
        for(let i of iter){
            if(i[1].type == 'GUILD_TEXT'){
                console.log("Loading " + i[1].name + " channel...");
                const permissions = i[1].permissionsFor(guild.me)
                if(i[1].permissionsFor(guild.me).has('VIEW_CHANNEL')){
                    channelMessages = await i[1].messages.fetchPinned();
>>>>>>> refactor
                    messageCollection = await messageCollection.concat(channelMessages);
                    console.log(i[1].name + " channel found!");
                }else{
                    console.log("Insufficient permissions to access " + i[1].name + " channel...");
                }

            }
        }

<<<<<<< HEAD
        messageArray = await messageCollection.array();

        for(let i = 0; i < messageArray.length; i++){
            if(messageArray[i].member){

                if(messageArray[i].author.bot != true && messageArray[i].attachments.size == 0){
                    await objectArray.push({
                        id: messageArray[i].id,
                        channelID: messageArray[i].channel.id,
                        guildID: messageArray[i].guild.id,
                        content: messageArray[i].content,
                        user: {
                            name: messageArray[i].member.nickname,
                            avatar: messageArray[i].author.avatarURL
                        },
                        attach: ""
                    });
                }
                else if(messageArray[i].author.bot == true && messageArray[i].attachments.size == 0){
                    await objectArray.push({
                        id: messageArray[i].id,
                        channelID: messageArray[i].channel.id,
                        guildID: messageArray[i].guild.id,
                        content: messageArray[i].embeds[0].description,
                        user: {
                            name: messageArray[i].member.nickname,
                            avatar: messageArray[i].author.avatarURL
                        },
                        attach: ""
                    });
                }
                else if(messageArray[i].author.bot != true && messageArray[i].attachments.size > 0){
                    await objectArray.push({
                        id: messageArray[i].id,
                        channelID: messageArray[i].channel.id,
                        guildID: messageArray[i].guild.id,
                        content: messageArray[i].content,
                        user: {
                            name: messageArray[i].member.nickname,
                            avatar: messageArray[i].author.avatarURL
                        },
                        attach: messageArray[i].attachments.first().url
                    });
                }
                else if(messageArray[i].author.bot == true && messageArray[i].attachments.size > 0){
                    await objectArray.push({
                        id: messageArray[i].id,
                        channelID: messageArray[i].channel.id,
                        guildID: messageArray[i].guild.id,
                        content: messageArray[i].embeds[0].description,
                        user: {
                            name: messageArray[i].member.nickname,
                            avatar: messageArray[i].author.avatarURL
                        },
                        attach: messageArray[i].attachments.first().url
                    });
                }
            }
            else continue;
        }

        await fs.writeFile(pinsPath, JSON.stringify(objectArray), function(error){
            if(error) throw error;
        });

        return 0;
    },

    getAllChannels: async function(guild){
        return guild.channels;
    }
}
=======
        messageArray = Array.from(messageCollection);

        for(let i = 0; i < messageArray.length; i++){

            // if(messageArray[i][1].member){
                try {
                    const nameObj = await messageArray[i][1].guild.members.fetch(messageArray[i][1].author);
                    const name = nameObj.nickname
                    const avatarURL = nameObj.user.avatarURL();
                    if(messageArray[i][1].author.bot != true && messageArray[i][1].attachments.size == 0){
                        await objectArray.push({
                            id: messageArray[i][1].id,
                            channelID: messageArray[i][1].channel.id,
                            guildID: messageArray[i][1].guild.id,
                            content: messageArray[i][1].content,
                            user: {
                                name: name,
                                avatar: avatarURL
                            },
                            attach: ""
                        });
                    }
                    else if(messageArray[i][1].author.bot == true && messageArray[i][1].attachments.size == 0){
                        await objectArray.push({
                            id: messageArray[i][1].id,
                            channelID: messageArray[i][1].channel.id,
                            guildID: messageArray[i][1].guild.id,
                            content: messageArray[i][1].embeds[0].description,
                            user: {
                                name: messageArray[i][1].member.nickname,
                                avatar: messageArray[i][1].author.avatarURL
                            },
                            attach: ""
                        });
                    }
                    else if(messageArray[i][1].author.bot != true && messageArray[i][1].attachments.size > 0){
                        await objectArray.push({
                            id: messageArray[i][1].id,
                            channelID: messageArray[i][1].channel.id,
                            guildID: messageArray[i][1].guild.id,
                            content: messageArray[i][1].content,
                            user: {
                                name: messageArray[i][1].member.nickname,
                                avatar: messageArray[i][1].author.avatarURL
                            },
                            attach: messageArray[i][1].attachments.first().url
                        });
                    }
                    else if(messageArray[i][1].author.bot == true && messageArray[i][1].attachments.size > 0){
                        await objectArray.push({
                            id: messageArray[i][1].id,
                            channelID: messageArray[i][1].channel.id,
                            guildID: messageArray[i][1].guild.id,
                            content: messageArray[i][1].embeds[0].description,
                            user: {
                                name: messageArray[i][1].member.nickname,
                                avatar: messageArray[i][1].author.avatarURL
                            },
                            attach: messageArray[i][1].attachments.first().url
                        });
                    }
                } catch (error) {
                    console.log(error);
                }

            // }
        // else continue;
        }

        fs.writeFileSync(pinsPath, JSON.stringify(objectArray), function(error){
            if(error) throw error;
        });

        const pins = fs.readFileSync(pinsPath, 'utf8', function (error, data) {
            if(error) throw error;
            return data
        });

        if(pins.length) {
            return 200;
        } else {
            return 500
        }
    }

    const getAllChannels = async function(guild){
        return guild.channels;
    }

export { currentChannelID, loadPins, getAllChannels }
>>>>>>> refactor
