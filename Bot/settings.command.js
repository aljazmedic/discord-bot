import  Command  from './Command';
import { MessageEmbed } from 'discord.js';

function settingsToFields(settings, filterFn = () => true) {
	const retArr = [];
	Object.entries(settings)
		.filter(filterFn)
		.forEach(([key, value]) => {
			retArr.push({
				name: key.toString(),
				value: value || ':x:',
			});
		});
	return retArr;
}

const settingsFn = (msg, client, params) => {
    const { settings } = params;
    if (!params.args.length < 1) {
        const settingsEmbed = new MessageEmbed()
            .setTitle('Settings')
            .addFields(settingsToFields(settings));
        return msg.reply(settingsEmbed);
    }
    const settingsName = params.length[0].toString();
    if (!params.args.length < 2) {
        const settingsEmbed = new MessageEmbed()
            .setTitle('Settings')
            .addFields(
                settingsToFields(settings, ([key]) =>
                    key.startsWith(settingsName),
                ),
            );
        return msg.reply(settingsEmbed);
    }
};

export function createSettingsCommand() {
    return new Command('settings', settingsFn);
}
