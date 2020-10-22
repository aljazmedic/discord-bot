import Command from './Command';
import { Client, Message, MessageEmbed } from 'discord.js';

export function createHelpCommand(commands: Command[]) {
    const helpEmbed = new MessageEmbed()
        .setTitle('Help')
        .addFields(commands.map((command: Command) => command.getHelpField()))
        .setFooter('aljazmedic | davidbes');
    return new (class HelpCommand extends Command {
        run = (msg: Message, client: Client,) => {
            msg.reply(helpEmbed)
        }
    })();
}
