import { Message } from "discord.js";
import { nextTick } from "process";
import Bot, { Command } from "../Bot";
import { CommandMessage, CommandResponse } from "../Bot/Command";


export default class Remove extends Command {

    constructor() {
        super("rm");
        this.alias("rmc", "rmr")
        this.before((msg, client, bot, next) => {
            if (msg.author.id == "205802315393925120") return next()
        })
    }
    run(msg: Message, client: Bot, res: CommandResponse) {

    }
}