import Command, { CommandFunction } from './Command';
import { MessageEmbed } from 'discord.js';

function settingsToFields(settings: any, filterFn = ([key,value]:[string, unknown]) => true) {
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
    const { settings } = params;
    if (!(params.args.length < 1)) {
        const settingsEmbed = new MessageEmbed()
            .setTitle('Settings')
            .addFields(settingsToFields(settings));
        return msg.reply(settingsEmbed);
    }
    const settingsName: string = params.args[0].toString();
    if (!(params.args.length < 2)) {
        const settingsEmbed = new MessageEmbed()
            .setTitle('Settings')
            .addFields(
                settingsToFields(settings, ([key]): boolean => {
                    return key.startsWith(settingsName);
                })
            );
        return msg.reply(settingsEmbed);
    }
};

export function createSettingsCommand() {
    return new (class SettingsCommand extends Command{
        constructor(){
            super()
            this.name='settings';
        } 
        run = settingsFn;
    })();
}
