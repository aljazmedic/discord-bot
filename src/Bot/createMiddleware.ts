import { Client, Message } from "discord.js";
import { CommandParameters } from "./Command";
import { NextFunction } from "./MiddlewareManager";

export default ({ args = [], minNum = 0, maxNum = Infinity }) => { //TODO Verificators
    minNum = Math.max(minNum, args.length);
    return (msg:Message, client:Client, params:CommandParameters, next:NextFunction) => {
        if (params.args.length < minNum) {
            next({
                sendDiscord: `Minimal expected number of arguments is ${minNum}`,
            });
        }
        if (params.args.length > maxNum) {
            next({
                sendDiscord: `Maximum allowed number of arguments is ${maxNum}`,
            });
        }
        args.forEach((e, idx) => {
            const givenArg = params.args[idx];
            if (Array.isArray(e) && !(givenArg in e)) {
                next({
                    sendDiscord: `Argument ${idx + 1} must be one of (${e.join(
                        '|'
                    )})`,
                });
            } else if (typeof e == 'string' && givenArg !== e) {
                next({
                    sendDiscord: `Argument ${idx + 1} must be ${e}`,
                });
            }
            if (typeof e == 'function') {
                const err = e(givenArg);
                if (err)
                    next({
                        sendDiscord: `Argument ${idx + 1} ${err}`,
                    });
            }
        });
        next();
    };
};
