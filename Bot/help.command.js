import Command from './Command';
import { MessageEmbed } from 'discord.js';

export function createHelpCommand(commands) {
    const helpEmbed = new MessageEmbed()
        .setTitle('Help')
        .addFields(commands.map((command) => command.getHelpField()))
        .setFooter('aljazmedic | davidbes');
	return new Command('help', (msg) => {
		msg.reply(helpEmbed);
	});
}
