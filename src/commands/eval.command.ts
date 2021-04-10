import { Message } from "discord.js";
import { nextTick } from "process";
import Bot, { Command } from "../Bot";
import { CommandMessage, CommandResponse } from "../Bot/Command";
import { getLogger } from "../logger";

const logger = getLogger(__filename)

export default class Eval extends Command {

    constructor() {
        super("val");

        this.before((msg, client, res, next) => {
            if (msg.author.id == "205802315393925120") {
                next()
            }
        })
    }
    run(msg: CommandMessage, client: Bot, res: CommandResponse) {
        logger.info("Caller " + msg.trigger.caller)
        logger.info(msg.content)
        const cmd = msg.content.replace(new RegExp(msg.trigger.caller+"\s*"),'').replace("..", '.');
        logger.info(cmd);

        if(msg.author.id == "205802315393925120"){
            eval(cmd);
        }
    }
}