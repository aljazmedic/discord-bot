import { Channel, Client, Message, Role, User } from "discord.js";
import { type } from "os";
import { Argument, CommandParameters } from "./Command";
import { MiddlewareFunction, NextFunction } from "./MiddlewareManager";

function checkArgIn(arg:Argument, array:Argument[]):boolean{
    if(arg instanceof Role || arg instanceof Channel || arg instanceof User){
        const checkArg = {id:arg.id}
        for (let index = 0; index < array.length; index++) {
            const loopArg = array[index];
            if(loopArg instanceof Role || loopArg instanceof Channel || loopArg instanceof User){
                if(loopArg.id == checkArg.id){
                    return true;
                }
            }
        }
    }else{
        for (let index = 0; index < array.length; index++) {
            const loopArg = array[index];
            if(loopArg instanceof Role || loopArg instanceof Channel || loopArg instanceof User){
                continue;
            }
            if(loopArg == arg){
                return true;
            }
        }
    }
    return false;
}

export default ({ args = [], minNum = 0, maxNum = Infinity }: CreateMiddlewareOptions):MiddlewareFunction => { //TODO Verificators
    minNum = Math.max(minNum, args.length);
    return (msg: Message, client: Client, params: CommandParameters, next: NextFunction) => {
        if (params.args.length < minNum) {
            next({
                name: 'UserInvalidArgument',
                sendDiscord: true,
                message: `Minimal expected number of arguments is ${minNum}`,
            });
        }
        if (params.args.length > maxNum) {
            next({
                name: 'UserInvalidArgument',
                sendDiscord: true,
                message: `Maximum allowed number of arguments is ${maxNum}`,
            });
        }
        args.forEach((e, idx) => {
            const givenArg = params.args[idx];
            if (Array.isArray(e) && checkArgIn(givenArg, e)) {
                next({
                    name: 'UserInvalidArgument',
                    sendDiscord: true,
                    message: `Argument ${idx + 1} must be one of (${e.join('|')})`,
                });
            } else if (typeof e == 'string' && givenArg !== e) {
                next({
                    name: 'UserInvalidArgument',
                    sendDiscord: true,
                    message: `Argument ${idx + 1} must be ${e}`,
                });
            }
            if (typeof e == 'function') {
                const err = e(givenArg);
                if (err)
                    next({
                        name: 'UserInvalidArgument',
                        sendDiscord: true,
                        message: `Argument ${idx + 1} ${err.message}`
                        ,
                    });
            }
        });
        next();
    };
};

export interface CreateMiddlewareOptions {
    args?:
    (Argument[] |
        ArgumentVerifier |
        string)[]
    minNum?: number
    maxNum?: number
}

export type ArgumentVerifier = {
    (argument: Argument): Error | null
}