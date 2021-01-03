import { Client, ReactionEmoji } from "discord.js";
import Bot, { Command } from "../Bot";
import { CommandMessage, CommandResponse } from "../Bot/Command";
import { selfDeleteCtrl } from "../Bot/messageControls";
import { GuildDB } from "../Bot/models";
import { getLogger } from "../logger";
const logger = getLogger(__filename)

export default class Invite extends Command {
    constructor() {
        super("invite");
        this.description = 'Generates the invite link!';

        this.alias("inv")
    }

    run(msg: CommandMessage, client: Bot, res: CommandResponse) {
        //final function
        res.channelReply(client.createInvite());
    }
};
