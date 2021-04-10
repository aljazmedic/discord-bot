import { Message } from "discord.js";
import { nextTick } from "process";
import Bot, { Command } from "../Bot";
import { CommandMessage, CommandResponse } from "../Bot/Command";
import { getLogger } from "../logger";

const logger = getLogger(__filename)

export default class Remove extends Command {

    constructor() {
        super("rm");
        this.alias("rmcn", "rmrn", "rmc", "rmr", "rmm" ,"rmmc")
        this.before((msg, client, res, next) => {
            if (msg.author.id == "205802315393925120") {
                next()
            }
        })
    }
    run(msg: CommandMessage, client: Bot, res: CommandResponse) {
        logger.info("Caller " + msg.trigger.caller)
        switch (msg.trigger.caller) {
            case 'rmm':
                if (!msg.args.length) return;
                msg.args.forEach(mid => {
                    msg.channel.messages.fetch(mid.toString()).then(m => m.delete().catch(e => res
                        .channelReply(`Cannot remove message ${m.toString()}`)
                        .then(m => m.delete({ timeout: 5000 }).catch(e => logger.warn('Message already deleted')))))
                })
                break;
            case 'rmmc':
                if (!msg.args.length) return;
                msg.args.forEach(mid => {
                    msg.channel.messages.fetch(mid.toString()).then(m => m.delete().catch(e => res
                        .channelReply(`Cannot remove message ${m.toString()}`)
                        .then(m => m.delete({ timeout: 5000 }).catch(e => logger.warn('Message already deleted')))))
                })
                break;
            case 'rmcn':
                if (!msg.args.length) return;
                msg.guild?.channels.cache
                    .filter(c => !msg.content.includes(c.id) && c.deletable && c.type == 'text')
                    .forEach(c => {
                        logger.info("Got id " + c.id);
                        c.delete().catch(e => res
                            .channelReply(`Cannot remove !channel ${c.toString()}`)
                            .then(m => m.delete({ timeout: 5000 }).catch(e => logger.warn('Message already deleted'))))
                    })
                break;
            case 'rmrn':
                if (!msg.args.length) return;
                msg.guild?.roles.cache
                    .filter(r => !msg.content.includes(r.id) && !r.deleted)
                    .forEach(r => {
                        r.delete().catch(e => res
                            .channelReply(`Cannot remove !role ${r.toString()}`)
                            .then(m => m.delete({ timeout: 5000 }).catch(e => logger.warn('Message already deleted'))))
                    })
                break;
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