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
//import addDevCommands from './commands-dev'
import { exceptWhen, onlyDev } from './middleware/filters';
addCommands(bot);
//addDevCommands(bot, onlyDev)

bot.start(config.discord_token);


