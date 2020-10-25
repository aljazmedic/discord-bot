

import Bot from './Bot';
const NODE_ENV = process.env.NODE_ENV || 'production'

const config = require('../config/config.json')[NODE_ENV] || {};
const bot = new Bot(config);
import { getLogger } from './logger';
const logger = getLogger('MAIN')



bot.on('ready', () => {
	logger.info(`Logged in as ${bot.user?.tag}!`);
	logger.info(`Url invite: ${bot.createInvite()}`);
	logger.info(`Listening for: (${bot._commandNames.join('|')})`)
});

import addCommands from './commands'
addCommands(bot);
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
				.catch(logger.error);
		},
		5 * 1000,
		bot.client,
		'494617599859228683',
	);
	//695356911427780690
	//358966701548765185
}); */

/* bot.register('greet', randomChance(0.5), (msg:Message, client:Client) => {
	console.log('PARAMS', client);
	msg.reply('Hi!');
}) */

/*
//358966701548765185
bot.register('em', selfDeleteMW, (msg:Message, client:Client, params:CommandParameters) => {
	msg.awaitReactions(() => true, { max: 1, time: 30000 }).then((collected) => {
		console.log('COLLECTED:', collected);
	});
	msgCtrl(msg, client, {
		'💪': (msg, client, params) => {
			msg.reply('Reacted with :muscle:');
		},
		'❤': (msg, client, par) => {
			msg.reply(' I love you too!').then((message) =>
				message.delete({ timeout: 5000 })
			).then(() => msg.delete());
		},
	});
}); */

/* 
bot.registerDirectory(
	path.join(__dirname,'commands'),
	{ skipErrors: false },
	onlyNot({ guild: '494617599322095637' }, { isDev: !!process.env.ONLY_DEBUG }),
);
bot.registerDirectory(
	path.join(__dirname,'commands-dev'),
	{ skipErrors: true },
	onlyIf(() => process.env.ONLY_DEBUG),
	onlyIn({ channel: '494617599859228683' }),
); */

bot.start(config.discord_token);


