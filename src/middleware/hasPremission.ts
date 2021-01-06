import { MessageEmbed, PermissionResolvable, Permissions, PermissionString } from "discord.js";
import Bot, { DiscordBotError } from "../Bot";
import { CommandFunction, CommandMessage, CommandResponse } from "../Bot/Command";
import { MiddlewareFunction, NextFunction } from "../Bot/MiddlewareManager";
import logger from "../logger";
import { idIsDev } from "./filters";

export { Permissions };


function titleCase(s: string) {
    return s.toLowerCase().split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export function hasPremission(prem: PermissionResolvable, options: PremissionOptions = {}): MiddlewareFunction {
    const { devCheck: denyDev = false, errOnFail = false, replyOnFail = true } = options;
    const missingPermissions = (msg: CommandMessage): PermissionError | null => {
        if (idIsDev(msg.author.id) && !denyDev) return null;
        const authorPerm = msg.channel.permissionsFor(msg.author);
        logger.debug("Author premissions: " + authorPerm?.bitfield.toString(2));
        if (!authorPerm) return {
            name: "PermError",
            message: "Failed to retrieve user permissions",
            missingPermissions: []
        }
        const ms = authorPerm.missing(prem);
        if (ms.length > 0) return {
            name: "PermMissing",
            message: (msg.member?.nickname || msg.author.username) + " Missing some permissions: " + ms,
            missingPermissions: ms
        }
        return null;

    }
    return (msg: CommandMessage, bot: Bot, res: CommandResponse, next: NextFunction) => {
        const chkError = missingPermissions(msg);
        if (chkError) {
            if (chkError.name == "PermMissing")
                logger.info(chkError)
            if (chkError.name == "PermError") {
                return next(chkError);
            } else if (replyOnFail) {
                logger.debug("Replying with insuffisient permissions embed");
                const msg = `you are missing one or more permissions in this channel: \`${chkError.missingPermissions.map(m => titleCase(m)).join("\`, \`")}\``
                res.msgReply(msg)
            }
            if (errOnFail) {
                return next(chkError);
            }
        } else {
            logger.debug((msg.member?.nickname || msg.author.username) + " Sufficient permissions.")
            return next();
        }
    }
}

interface PermissionError extends DiscordBotError {
    missingPermissions: PermissionString[];
    name: "PermMissing" | "PermError"
}

type PremissionOptions = {
    devCheck?: boolean;
    errOnFail?: boolean;
    replyOnFail?: boolean;
}
