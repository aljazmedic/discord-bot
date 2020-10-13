import Command from './Command';
import { Message, MessageEmbed } from 'discord.js';

export function createHelpCommand(commands:Command[]) {
    const helpEmbed = new MessageEmbed()
        .setTitle('Help')
        .addFields(commands.map((command:Command) => command.getHelpField()))
        .setFooter('aljazmedic | davidbes');
	return new Command('help', (msg:Message) => {
		msg.reply(helpEmbed);
	});
}
