import Discord from 'discord.js';
import * as fs from 'fs';

// TODO: instead of just getting pins from channels and rewriting the file every time, parse the text file first and then compare JSONs and 
// if there's a difference, then rewrite

    const getCurrentChannelID = function(guild, client){
        let latestChannel = 0;
        /* guild.channels.cache.forEach(function(channel){
            if(channel.type == 'text'){
                latestChannel = channel.id;
                if(channel.createdTimestamp > latestChannel.createdTimestamp) latestChannel = channel.id;
            }
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
        
        let channelMessages = new Discord.Collection();
        let messageCollection = new Discord.Collection();
        let guild = channel.guild;
        let messageArray = new Array();
        let objectArray = new Array();
        
        let iter = Array.from(guild.channels.cache)[Symbol.iterator]();
        for(let i of iter){
            if(i[1].type == 'GUILD_TEXT'){
                console.log("Loading " + i[1].name + " channel...");
                const permissions = i[1].permissionsFor(guild.me)
                if(i[1].permissionsFor(guild.me).has('VIEW_CHANNEL')){
                    channelMessages = await i[1].messages.fetchPinned();
                    var channelPins = Array.from(channelMessages);
                    if(channelPins.length > 44 && channelPins.length != 50) {

                        var lastPinId = channelPins[0][1].id;
                        var systemPinMessage = await i[1].messages.fetch({limit: 100}).then(messages => {
                            var lastMessagesArray = Array.from(messages);
                            for(var message of lastMessagesArray) {
                                if(message[1].reference && message[1].reference.messageId == lastPinId) {
                                   return message[1];
                                }
                            }
                        });
                        
                        if(systemPinMessage) {
                            // systemPinMessage[1].client.emojis/find(emoji => emoji.name == reaction)
                            var reaction = ""
                            switch (50 - channelPins.length) {
                                case 1:
                                    reaction = "1⃣📌";
                                    break;
                                case 2:
                                    reaction = "2⃣";
                                    break;
                                case 3:
                                    reaction = "3⃣";
                                    break;
                                case 4:
                                    reaction = "4⃣";
                                    break;
                                case 5:
                                    reaction = "5⃣";
                            }
                            const reactionsArray = [reaction, '📌', '🇱', '🇪', '🇫', '🇹']
                            reactionsArray.forEach(element => systemPinMessage.react(element));
                        }
                    }
                    messageCollection = await messageCollection.concat(channelMessages);
                    console.log(i[1].name + " channel found!");
                }else{
                    console.log("Insufficient permissions to access " + i[1].name + " channel...");
                }

            }
        }

        messageArray = Array.from(messageCollection);

        for(let i = 0; i < messageArray.length; i++){

            // if(messageArray[i][1].member){
                try {
                    const nameObj = await messageArray[i][1].guild.members.fetch(messageArray[i][1].author);
                    const name = nameObj.nickname ? nameObj.nickname : nameObj.user.username;
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
                            date: messageArray[i][1].createdAt,
                            attach: ""
                        });
                    }
                    else if(messageArray[i][1].author.bot == true && messageArray[i][1].attachments.size == 0){
                        await objectArray.push({
                            id: messageArray[i][1].id,
                            channelID: messageArray[i][1].channel.id,
                            guildID: messageArray[i][1].guild.id,
                            ...(messageArray[i][1].embeds[0]) && {content:messageArray[i][1].embeds[0].description},
                            user: {
                                name: messageArray[i][1].member.nickname,
                                avatar: messageArray[i][1].author.avatarURL
                            },
                            date: messageArray[i][1].createdAt,
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
                            date: messageArray[i][1].createdAt,
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
                            date: messageArray[i][1].createdAt,
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
            return 500;
        }
    }

    const getAllChannels = async function(guild){
        return guild.channels;
    }

export { getCurrentChannelID, loadPins, getAllChannels }
