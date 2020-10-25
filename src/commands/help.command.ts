import Command, { CommandMessage } from '../Bot/Command';
import { Client, Message, MessageEmbed } from 'discord.js';
import Bot from '../Bot';

export default class Help extends Command {
    constructor() {
        super();
        this.name = 'help'
        
    }

    run(msg:CommandMessage, client: Bot) {
        const helpEmbed = new MessageEmbed()
            .setTitle('Help')
            .addFields(client.commands.map((command: Command) => command.getHelpField(client)))
            .setFooter('Made by bot team with :heart:')
            //.setThumbnail('https://avatars3.githubusercontent.com/u/35614267?s=400&v=4')
        return msg.reply(helpEmbed)
    }

}