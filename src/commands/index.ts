
import Command from '../Bot/Command';
import Bot from '../Bot';

import Ping from './ping.command';
import Days from './days.command';
import Clean from './clean.command';
import Random from './random.command'
import Teams from './team.command'
import Config from './config.command';
import Sound from "./sound.command";
import Joke from "./joke.command";
import Help from './help.command';

export const exportDict: { [index: string]: typeof Command } = { Ping, Days, Clean, Teams, Random };
export default (bot: Bot): void => {
    bot.addCommand(new Config(),
        new Ping(),
        new Days(),
        new Clean(),
        new Random(),
        new Teams(),
        new Sound(),
        new Joke(),
        new Help())
}