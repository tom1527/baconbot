import { MessageEmbed } from 'discord.js';

async function displayTrelloNotifications(client, notification) {
    // if(typeof(notification == ))
    var data = {}
    const user = notification.action.memberCreator ? notification.action.memberCreator.username : "";
    const card = notification.action.display.entities.card ? notification.action.display.entities.card.text : "";
    const list = notification.action.display.entities.list ? notification.action.display.entities.list.text : "";
    const checklist = notification.action.display.entities.checklist ? notification.action.display.entities.checklist.text : "";
    const checkItem = notification.action.display.entities.checkitem ? notification.action.display.entities.checkitem.text : "";
    const checkItemStatus = notification.action.display.entities.checkitem ? notification.action.display.entities.checkitem.state : "";

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
        case 'deleteCard':
            data = {
                title: 'Card Delete',
                description: `User **${user}** deleted the card **${card} on the list **${list}`,
                color: '#E74C3C'
            }
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
            data = {
                title: 'User Added to Card',
                description: `User **${user}** added to the card **${card}**`,
                color: '#E67E22'
            }
            break
        case 'removeMemberFromCard':
            data = {
                title: 'User Removed from Card',
                description: `User **${user}** remove from the card **${card}**`,
                color: '#E67E22'
            }
            break
        case 'addChecklistToCard':
            data = {
                title: 'Checklist Added to Card',
                description: `User **${user}** added the checklist **${checklist}** to the card **${card}**`,
                color: '#0000FF'
            }
            break
        case 'removeChecklistFromCard':
            data = {
                title: 'Checklist Removed from Card',
                description: `User **${user}** removed the checklist **${checklist}** from the card **${card}**`,
                color: '#E74C3C'
            }
            break
        case 'createCheckItem':
            data = {
                title: 'Checklist Item added to Checklist',
                description: `User **${user}** added the checklist item **${checkItem}** to the checklist **${checklist}** on the card **${card}**`,
                color: '#0000FF'
            }
            break
        case 'removeChecklistFromCard':
            data = {
                title: 'Checklist item Removed from Checklist',
                description: `User **${user}** removed the checklist item **${checkItem}** from the checklist **${checklist}** on the card **${card}**`,
                color: '#E74C3C'
            }
            break
        case 'updateCheckItemStateOnCard':
            data = {
                title: 'Checklist Item Updated on Checklist',
                description: `User **${user}** updated the checklist item **${checkItem}** on the checklist **${checklist}** on the card **${card}** to **${checkItemStatus}**`,
                color: '#0000FF'
            }
            break

    }
    const embed = new MessageEmbed(data);
    const channel = client.channels.cache.get('980078956868956160');
    channel.send({embeds: [embed]});
}
export default { displayTrelloNotifications }