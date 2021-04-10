import Command, { CommandFunction, CommandMessage, CommandResponse } from '../Bot/Command';
import { MessageEmbed } from 'discord.js';
import { GuildDB, sequelize } from '../Bot/models';
import Bot from '../Bot';
import { ok } from 'assert';
import { placeholder } from 'sequelize/types/lib/operators';

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

export default class SettingsCommand extends Command {
    constructor() {
        super('settings')
    }
    run(msg: CommandMessage, client: Bot, res: CommandResponse) {
        const MM = <string>msg.args[0] || 'Guild';
        const pk = <string>msg.args[1] || msg.guild!.id;
        const where: { [index: string]: string } = {};
        console.log(msg.args)
        if (msg.args.length == 2) {
            if (pk.includes(':')) {
                const [k, v] = pk.split(":", 2)
                where[k] = v;
            } else {
                where['id'] = pk;
            }
        }
        const typeofModel = sequelize.models[MM]
        typeofModel.findAll({ where,limit:5 }).then(guilds => {
            msg.channel.send(`${MM}\`\`\`json\n${JSON.stringify(guilds, undefined, 4)}\n\`\`\``)
        })
    };
}
