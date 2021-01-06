import Bot from './Bot';
import config from "./config";
import { Permissions } from 'discord.js'
import { getLogger } from './logger';
const logger = getLogger('MAIN')


const bot = new Bot(config);

bot.on('ready', () => {
	logger.info(`Logged in as ${bot.user?.tag}!`);
	logger.info(`Url invite: ${bot.createInvite()}`);
	logger.info(`Listening for: (${bot._commandNames.join('|')})`)
});

import addCommands from './commands'
import addDevCommands from './commands-dev'
import { ifNotMessage, onlyDev } from './middleware/filters';
import { cooldown, hasPremission } from './middleware';
addCommands(bot, cooldown({ cooldown: 3000 }));
if (process.env.NODE_ENV === "development")
	addDevCommands(bot, onlyDev)

bot.start(config.discord_token).then(() => {
	bot.guilds.cache.forEach((g, k) => {
		const me = g.members.cache.find((gm) => (!!bot.user && (gm.user.id == bot.user.id)));
		me?.setNickname("Turbo Bot")
	})
});


