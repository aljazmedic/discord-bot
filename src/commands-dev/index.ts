
import Command from '../Bot/Command';
import Bot from '../Bot';

import Remove from './remove.command';
import { MiddlewareFunction } from '../Bot/MiddlewareManager';
import SettingsCommand from './settings.command';
import Eval from './eval.command';

const allCommands:Command[] = [
    new Remove(),
    new SettingsCommand(),
    new Eval()
]

export default (bot: Bot, ...middlewares:MiddlewareFunction[]): void => {
    allCommands.forEach((c)=>{
        c.before(...middlewares)
    })
    bot.addCommand(...allCommands)
}