
import Command from '../Bot/Command';
import Bot from '../Bot';

import Ping from './ping.command';
import Days from './days.command';
import Clean from './clean.command';
import Random from './random.command'
import Teams from './team.command'
import Config from './config.command';
import Sound from "./sound.command";
import SQLJoke from "./jokeSQL.command";
import Help from './help.command';
import { MiddlewareFunction } from '../Bot/MiddlewareManager';
import Urban from './urban.command';
import Qran from './qran.command';
import RPS from './rck-ppr-scisors.command';
import Poll from './poll.command';
import Invite from './invite.command';
import Modrost from './modrost.command';
import Remove from './remove.command';
import SettingsCommand from './settings.command';
import Eval from './eval.command';
import Joke from './joke.command';

const allCommands: Command[] = [
    new Config(),
    new Ping(),
    new Days(),
    new Clean(),
    new Random(),
    new Teams(),
    new Sound(),
    new Help(),
    new Urban(),
    new Qran(),
    new RPS(),
    new Invite(),
    new Joke(),
    new Modrost()
]


const devCommands: Command[] = [
    //new SQLJoke(),
    //new Remove(),
    //new SettingsCommand(),
    //new Eval(),
    //new Poll()
]

export function addDevCommands(bot: Bot, ...middlewares: MiddlewareFunction[]): void {
    devCommands.forEach((c) => {
        c.before(...middlewares)
    })
    bot.addCommand(...devCommands)
}

export default (bot: Bot, ...middlewares: MiddlewareFunction[]): void => {
    allCommands.forEach((c) => {
        c.before(...middlewares)
    })
    bot.addCommand(...allCommands)
}