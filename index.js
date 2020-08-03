import Bot from './Bot';
import {
    parseIdsToObjects,
    parseNumbers,
    randomChance,
    only
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
    (msg, client) => {
        console.log('PARAMS', client);
        msg.reply('Hi!');
    }
);

bot.registerDirectory('./commands', { skipErrors: true });
bot.registerDirectory('./commands-dev', { skipErrors: true }, only({channel:'494617599859228683'}));

console.log(bot.commands);
bot.start(DISCORD_TOKEN);
