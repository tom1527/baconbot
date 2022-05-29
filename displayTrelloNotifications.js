import { MessageEmbed } from 'discord.js';

async function displayTrelloNotifications(client, notification) {
    // if(typeof(notification == ))
    if(notification.action.type == 'updateCard') {
        switch(notification.action.display.translationKey) {
            case 'action_move_card_from_list_to_list':
                const data = {
                    title: "Card Updated",
                    description: `The card ${notification.action.display.entities.card.text} was moved from ${notification.action.display.entities.listBefore.text} to ${notification.action.display.entities.listAfter.text} by user ${notification.action.memberCreator.username}`,
                    color: 0x09aa03
                }
                const embed = new MessageEmbed(data);
                const channel = client.channels.cache.get('980078956868956160');
                channel.send({embeds: [embed]});
        }
    }
}
export default { displayTrelloNotifications }