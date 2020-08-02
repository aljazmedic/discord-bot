import Bot from './Bot';
import {
    parseIdsToObjects,
    parseNumbers,
    randomChance,
} from './Bot/middlewares';
if (process.env.NODE_ENV == 'development') {
    require('dotenv').config();
}

const { DISCORD_TOKEN } = process.env;

const bot = new Bot('?');

bot.onReady(() => {
    console.info(`Logged in as ${bot.user.tag}!`);
    console.info(`Url invite: ${bot.createInvite()}`);
});

bot.register(
    'greet',
    randomChance(0.5),
    (msg, client, params, next) => {
        console.log('RANDOMMM');
        next();
    },
    (msg, client, params) => {
        console.log('PARAMS', client);
        msg.reply('Hi!');
    }
);

bot.registerDirectory('./commands', { skip: true });

console.log(bot.commands);
bot.start(DISCORD_TOKEN);
