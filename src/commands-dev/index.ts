
import Command from '../Bot/Command';
import Bot from '../Bot';

import Remove from './remove.command';

export default (bot: Bot): void => {
    const r = new Remove();
    r.before((msg, client, params, next) => {
        if (msg.author.id == "205802315393925120")
            next();
    })
    bot.addCommand(r)
}