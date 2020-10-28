import { Message } from "discord.js";
import { nextTick } from "process";
import Bot, { Command } from "../Bot";
import { CommandMessage, CommandResponse } from "../Bot/Command";
import logger from "../logger";


export default class Remove extends Command {

    constructor() {
        super("rm");
        this.alias("rmc", "rmr")
        this.before((msg, client, res, next) => {
            if (msg.author.id == "205802315393925120") {
                next()
            }
        })
    }
    run(msg: CommandMessage, client: Bot, res: CommandResponse) {
        switch (msg.trigger.caller) {
            case 'rmc':
                msg.args.forEach(ch => {
                    client.channels
                        .fetch(ch.toString())
                        .then(c => c.delete())
                        .catch(e => res
                            .channelReply(`Cannot remove channel ${ch.toString()}`)
                            .then(m => m.delete({ timeout: 5000 }).catch(e => logger.warn('Message already deleted'))))
                })
                break;
            case 'rmr':
                msg.args.forEach(rl => {
                    msg.guild!.roles
                        .fetch(rl.toString())
                        .then(c => c?.delete())
                        .catch(e => res
                            .channelReply(`Cannot remove role ${rl.toString()}`)
                            .then(m => m.delete({ timeout: 5000 }).catch(e => logger.warn('Message already deleted'))))
                })
                break;
        }
    }
}