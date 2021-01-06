import { User } from "discord.js";
import { nextTick } from "process";
import Bot from "../Bot";
import { CommandMessage, CommandResponse } from "../Bot/Command";
import { MiddlewareFunction, NextFunction } from "../Bot/MiddlewareManager";
import { GuildDB } from "../Bot/models";
import logger from "../logger";
import { idIsDev } from "./filters";



export function cooldown(options: CooldownOptions & { exportReset: true }): [MiddlewareFunction, { (id: string): boolean }]
export function cooldown(options: CooldownOptions & { exportReset?: false | undefined }): MiddlewareFunction
export function cooldown(options: CooldownOptions = {}): MiddlewareFunction | [MiddlewareFunction, Function] {
    const { cooldown: cooldownMilli = 1000, dev: denyDev = false, exportReset } = options;
    const lastUses: CooldownDict = {}
    const checkAuthor = (user: User) => {
        if (idIsDev(user.id) && !denyDev) return true;
        const lastTime = lastUses[user.id];
        const currTime = +new Date();
        if (lastTime == undefined || (currTime - lastTime) > cooldownMilli) {
            lastUses[user.id] = currTime;
            return true;
        }
        return false;
    }
    const mw = (msg: CommandMessage, bot: Bot, res: CommandResponse, next: NextFunction) => {
        if (checkAuthor(msg.author)) {
            logger.debug("Cooldown passed");
            return next();
        }
        logger.info((msg.member?.nickname || msg.author.username) + " Cooldown prevented");
    };
    if (exportReset) {
        const resetter = (id: string) => {
            if (id in lastUses) {
                delete lastUses[id]
                return true;
            }
            return false;
        }
        return [mw, resetter]
    } else
        return mw
}

type CooldownDict = {
    [key: string]: number
}


export type CooldownOptions = {
    cooldown?: number;
    dev?: boolean;
    exportReset?: boolean;
}