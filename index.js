import Bot, { msgCtrl } from './Bot';
import { selfDeleteMW } from './Bot/messageControls';
import { Message } from 'discord.js';
import { randomChance, only, onlyNot, onlyIf } from './middleware';

if (process.env.NODE_ENV == 'development') {
	require('dotenv').config();
}

const { DISCORD_TOKEN } = process.env;

const bot = new Bot('?');

bot.onReady(() => {
	console.info(`Logged in as ${bot.user.tag}!`);
	console.info(`Url invite: ${bot.createInvite()}`);
});
/* 
bot.onReady(() => {
	setInterval(
		(client, channelId) => {
			client.channels
				.fetch(channelId)
				.then((channel) => {
					return channel.send('!clean');
				})
				.then((message) => {
					console.log(client);
					return message.delete();
				})
				.then(() => {})
				.catch(console.error);
		},
		5 * 1000,
		bot.client,
		'494617599859228683',
	);
	//695356911427780690
	//358966701548765185
}); */

bot.register('greet', randomChance(0.5), (msg, client) => {
	console.log('PARAMS', client);
	msg.reply('Hi!');
});
//358966701548765185
bot.register('em', selfDeleteMW, (msg, client, params) => {
	msg.awaitReactions(() => 1, { max: 1, time: 30000 }).then((collected) => {
		console.log('COLLECTED:', collected);
	});
	msgCtrl(msg, client, {
		'💪': (msg, client, par) => {
			msg.reply('Reacted with :muscle:');
		},
		'❤': (msg, client, par) => {
			msg.reply(' I love you too!').then((message) => 
				message.delete({ timeout: 5000 })
			).then(()=>msg.delete());
		},
	});
});

bot.registerDirectory(
	'./commands',
	{ skipErrors: false },
	onlyNot({ guild: '494617599322095637' }, { isDev: process.env.ONLY_DEBUG }),
);
bot.registerDirectory(
	'./commands-dev',
	{ skipErrors: true },
	onlyIf(() => process.env.ONLY_DEBUG),
	only({ channel: '494617599859228683' }),
);

bot.start(DISCORD_TOKEN);

console.log(bot.commands);
