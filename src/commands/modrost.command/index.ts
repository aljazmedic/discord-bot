import { Client, Message, Guild, ReactionEmoji } from "discord.js";
import Command, { CommandFunction, CommandMessage, CommandResponse } from "../../Bot/Command";
import { selfDeleteCtrl } from "../../Bot/messageControls";
import { GuildDB } from "../../Bot/models";
import { getLogger } from '../../logger';
import pregovori from './pregovori.json'
const logger = getLogger(__filename);

function dobiPregovor(){
    return pregovori[Math.floor(Math.random() * pregovori.length)];
}

export default class Modrost extends Command {
    constructor() {
        super("modrost");
        this.alias("pregovor", "pamet")
        this.description = 'amen';
    }

    run(msg: CommandMessage, client: Client, res: CommandResponse) {
        //final function
        res.channelReply(dobiPregovor());
    }
};
