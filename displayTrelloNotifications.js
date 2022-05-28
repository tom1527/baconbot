import { MessageEmbed } from 'discord.js';

async function displayTrelloNotifications(client, notification) {
    // if(typeof(notification == ))
    if(notification.type == 'updateCard') {
        switch(notification.display.translationKey) {
            case 'action_move_card_from_list_to_list':
                const data = {
                    title: "Card Updated",
                    description: `The card ${notification.display.entities.card.text} was moved from ${notification.display.entities.listBefore.text} to ${notification.display.entities.listAfter.text} by user ${notification.memberCreator.username}`,
                    color: 0x09aa03
                }
                const embed = new MessageEmbed(data);
                const channel = client.channels.cache.get('694914362095304771');
                channel.send('<content>');
        }
    }
}
export default { displayTrelloNotifications }