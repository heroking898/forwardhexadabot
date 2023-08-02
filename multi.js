const TelegramBot = require('node-telegram-bot-api');

const fs = require('fs');

const path = require('path');



const botToken = '6560308439:AAFnZquMUzByV4fKkOmtqALPLnO5gBIYRR8';

const bot = new TelegramBot(botToken, { polling: true });



const allowedUserId = '1300007476';



const channelsFilePath = path.join(__dirname, 'channels.json');



// Load channels from the JSON file

let channelsToForward = new Set();

try {

    const channelsData = fs.readFileSync(channelsFilePath, 'utf8');

    channelsToForward = new Set(JSON.parse(channelsData));

} catch (error) {

    console.error('Error loading channels from JSON:', error);

}



bot.onText(/\/addchannel (.+)/, (msg, match) => {

    const userId = msg.from.id.toString();

    if (userId === allowedUserId) {

        const channelToAdd = match[1];

        channelsToForward.add(channelToAdd);

        bot.sendMessage(msg.chat.id, `Channel ${channelToAdd} added for forwarding.`);



        // Save updated channels to the JSON file

        try {

            fs.writeFileSync(channelsFilePath, JSON.stringify(Array.from(channelsToForward)), 'utf8');

        } catch (error) {

            console.error('Error saving channels to JSON:', error);

        }

    } else {

        bot.sendMessage(msg.chat.id, 'You are not authorized to add channels.');

    }

});



bot.onText(/\/removechannel (.+)/, (msg, match) => {

    const userId = msg.from.id.toString();

    if (userId === allowedUserId) {

        const channelToRemove = match[1];

        channelsToForward.delete(channelToRemove);

        bot.sendMessage(msg.chat.id, `Channel ${channelToRemove} removed from forwarding.`);



        // Save updated channels to the JSON file

        try {

            fs.writeFileSync(channelsFilePath, JSON.stringify(Array.from(channelsToForward)), 'utf8');

        } catch (error) {

            console.error('Error saving channels to JSON:', error);

        }

    } else {

        bot.sendMessage(msg.chat.id, 'You are not authorized to remove channels.');

    }

});



bot.on('message', (msg) => {

    if (msg.chat.type === 'private' && msg.from.id.toString() === allowedUserId) {

        for (const channelId of channelsToForward) {

            bot.forwardMessage(channelId, msg.chat.id, msg.message_id)

                .then(() => {

                    console.log(`Message forwarded to channel ${channelId} from user ${msg.from.id}`);

                    bot.sendMessage(allowedUserId, `Message forwarded to channel ${channelId}`);

                })

                .catch((error) => {

                    console.error('Error forwarding message:', error);

                });

        }

    }

});



bot.on('polling_error', (error) => {

    console.error('Polling error:', error);

});

