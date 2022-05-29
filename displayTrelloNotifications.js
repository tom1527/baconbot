import { MessageEmbed } from 'discord.js';

async function displayTrelloNotifications(client, notification) {
    // if(typeof(notification == ))
    var data = {}
    const user = notification.action.memberCreator ? notification.action.memberCreator.username : "";
    const card = notification.action.display.entities.card ? notification.action.display.entities.card.text : "";
    const list = notification.action.display.entities.list ? notification.action.display.entities.list.text : "";
    switch(notification.action.type) {
        case 'updateCard':
            data = {
                title: 'Card Moved',
                description: `The card **${card}** was moved from **${notification.action.display.entities.listBefore.text}** to **${notification.action.display.entities.listAfter.text}** by user **${user}**`,
                color: 0x09aa03
            }
            break
        case 'createCard':
            data = {
                title: 'Card Created',
                description: `User **${user}** created the card **${card}** on the list **${list}**`,
                color: '#0000FF'
            }
            break
        case 'commentCard':
            data = {
                title: 'Comment on Card',
                description: `User **${user}** commented on the card **${card}**`,
                fields: [
                    {
                        name: 'Comment',
                        value: `${notification.action.display.entities.comment.text}`
                    }
                ]
            }
        case 'addMemberToCard':
            data ={
                title: 'User Added to Card',
                description: `User **${user}** added to the card **${card}**`
            }
            break
        case 'removeMemberFromCard':
            data = {
                title: 'User Removed from Card',
                description: `User **${user}** remove from the card **${card}**`
            }

    }
    const embed = new MessageEmbed(data);
    const channel = client.channels.cache.get('980078956868956160');
    channel.send({embeds: [embed]});
}
export default { displayTrelloNotifications }