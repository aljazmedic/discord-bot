import { Client, Message } from "discord.js";
import Command,{ DiscordBotError } from "./Command";
import {CommandParameters} from './Command';

export default class MiddlewareManager {
	stack: MiddlewareFunction[];
	numArgs: number = 4;
	constructor() {
		this.stack = [];;
	}

	use(...middlewareFunctions:MiddlewareFunction[]) {
		middlewareFunctions.forEach((middlewareFunction) => {
			if (typeof middlewareFunction !== "function")
				throw new Error("Middleware must be a function!");
			if (this.numArgs && middlewareFunction.length != this.numArgs)
				throw new Error("Middleware arguments don't match!");
			this.stack.push(middlewareFunction);
		});
	}

	handle(msg:Message, client:Client, params:CommandParameters, callback:ErrorCallback) {
		const errCallback:ErrorCallback = (err, ...othr) => {
			if (err) {
				console.log(err);
				if (err.sendDiscord) {
					msg.reply(err.sendDiscord);
				}
				params.isError = true;
				//TODO insert error handlers
			} else {
				return callback(...othr);
			}
		};

		let idx = 0;
		const next = (err?:Error) => {
			if (err != null) {
				return setImmediate(() => errCallback(err));
			}
			if (idx >= this.stack.length) {
				return setImmediate(() => errCallback(null, msg, client, params));
			}
			const nextMiddleware = this.stack[idx++];
			setImmediate(() => {
				try {
					nextMiddleware(msg, client, params, next);
				} catch (error) {
					next(error);
				}
			});
		};
		next();
	}
}


export interface MiddlewareFunction{
	(msg:Message, client:Client, params:CommandParameters, next?:NextFunction):void,	
}

export interface NextFunction{
	(err?:DiscordBotError):void
}

export interface ErrorCallback{
	(err?:Error|null, ...other:any[]):void
}