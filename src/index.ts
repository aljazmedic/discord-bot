import Bot from './Bot';
import config from "./config";
import { getLogger } from './logger';
const logger = getLogger('MAIN')


const bot = new Bot(config);

bot.on('ready', () => {
	logger.info(`Logged in as ${bot.user?.tag}!`);
	logger.info(`Url invite: ${bot.createInvite()}`);
	logger.info(`Listening for: (${bot._commandNames.join('|')})`)
});

import addCommands from './commands'
addCommands(bot);

bot.start(config.discord_token);


