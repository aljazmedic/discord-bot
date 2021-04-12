import { Client, Message, Guild, ReactionEmoji } from "discord.js";
import { Sequelize } from "sequelize-typescript";
import Command, { CommandFunction, CommandMessage, CommandResponse } from "../../Bot/Command";
import { GuildDB, Wisdom } from "../../Bot/models";
import { getLogger } from '../../logger';
const logger = getLogger(__filename);

export default class Modrost extends Command {
    constructor() {
        super("modrost");
        this.alias("pregovor", "pamet", "wisdom")
        this.description = 'Beri in se uči';
    }

    run(msg: CommandMessage, client: Client, res: CommandResponse) {
        //final function
        Wisdom.findAll({ order: Sequelize.literal('rand()'), limit: 1 }).then((v) => {
            if (v.length) {
                res.channelReply(v[0].besedilo);
            } else {
                res.channelReply("No wisdoms found")
            }
        }).catch(err => logger.error(err))
    }
};
