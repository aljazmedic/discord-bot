import Command, { CommandMessage, CommandResponse } from '../Bot/Command';
import { Client, Message, MessageEmbed } from 'discord.js';
import Bot from '../Bot';
import { NextFunction } from '../Bot/MiddlewareManager';

export default class Help extends Command {
    constructor() {
        super('help');
        this.alias('stuck', '?')
    }

    run(msg: CommandMessage, client: Bot, res: CommandResponse, next: NextFunction) {
        const helpEmbed = new MessageEmbed()
            .setTitle('Help')
            .addFields(client.commands.map((command: Command) => command.getHelpField(client)))
            .setFooter('Made by bot team with ❤')
        //.setThumbnail('https://avatars3.githubusercontent.com/u/35614267?s=400&v=4')
        return res.msgReply(helpEmbed)
    }

}