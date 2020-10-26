import Command, { CommandFunction } from '../Bot/Command';
import { MessageEmbed } from 'discord.js';
import { GuildDB } from '../Bot/models';

function settingsToFields(settings: any, filterFn = ([key, value]: [string, unknown]) => true) {
    const retArr: { name: string, value: string }[] = [];
    Object.entries(settings)
        .filter(filterFn)
        .forEach(([key, value]) => {
            retArr.push({
                name: key.toString(),
                value: <string>value || ':x:',
            });
        });
    return retArr;
}

const settingsFn: CommandFunction = (msg, client, params) => {

    GuildDB.findAll().then(guilds => {
        guilds.forEach(g => {
            msg.channel.send(JSON.stringify(g, undefined, 4))
        })
    })
};

export function createSettingsCommand() {
    return new (class SettingsCommand extends Command {
        constructor() {
            super('settings')
        }
        run = settingsFn;
    })();
}
