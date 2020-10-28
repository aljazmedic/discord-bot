
import Command from '../Bot/Command';
import Bot from '../Bot';

import Remove from './remove.command';
import { MiddlewareFunction } from '../Bot/MiddlewareManager';
import SettingsCommand from './settings.command';

const allCommands:Command[] = [
    new Remove(),
    new SettingsCommand()
]

export default (bot: Bot, ...middlewares:MiddlewareFunction[]): void => {
    allCommands.forEach((c)=>{
        c.before(...middlewares)
    })
    bot.addCommand(...allCommands)
}