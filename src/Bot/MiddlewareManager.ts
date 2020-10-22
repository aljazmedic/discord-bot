import { reject, resolve } from "bluebird";
import { Client, Message } from "discord.js";
import Bot, { DiscordBotError } from ".";
import Command, { CommandFunction } from "./Command";
import { CommandParameters } from './Command';

class Layer {
	handle: MiddlewareFunction | ErrorHandlingFunction;
	constructor(fn: MiddlewareFunction | ErrorHandlingFunction) {
		this.handle = fn;
	}
	handleError(err: DiscordBotError, msg: Message, client: Bot, params: CommandParameters, next: NextFunction) {
		if (this.handle.length !== 5) {
			return next(err)
		}
		const fn = <ErrorHandlingFunction>this.handle;
		try {
			fn(err, msg, client, params, next);
		} catch (e) {
			next(e);
		}
	}
	handleRequest(msg: Message, client: Bot, params: CommandParameters, next: NextFunction) {
		if (this.handle.length > 4) {
			//Not a command  handler
			return next();
		}
		const fn = <MiddlewareFunction>this.handle;
		try {
			fn(msg, client, params, next);
		} catch (e) {
			next(e);
		}
	}
}

export default class MiddlewareManager {
	stack: Layer[];
	numArgs: number = 4;
	constructor() {
		this.stack = [];
	}

	use(...middlewareFunctions: (MiddlewareFunction | ErrorHandlingFunction)[]) {
		middlewareFunctions.forEach((middlewareFunction) => {
			if (typeof middlewareFunction !== "function")
				throw new Error("Middleware must be a function!");
			switch (middlewareFunction.length) {
				case 4:
				case 5:
					this.stack.push(new Layer(middlewareFunction));
					break;
				default:
					throw Error("Invalid number of function arguments!");
			}
		});
	}

	/* handleError(err: DiscordBotError, msg: Message, client: Bot, params: CommandParameters, callback: ErrorCallback) {
		let idx = 0;
		const next: NextFunction = (e) => {
			if (idx >= this.stack.length) {
				return setImmediate(callback, e, msg, client, params);
			}
			const errorMW = this.errorStack[idx++];
			errorMW(<DiscordBotError>e, msg, client, params, next);
		};
		next(err);
	} */

	handle(msg: Message, client: Bot, params: CommandParameters, done: DoneCallback) {
		let idx = 0;
		const next: NextFunction = (err) => {
			if (err || idx >= this.stack.length) {
				return done(err, msg, client, params);
			}

			const nextLayer = this.stack[idx++];
			if (!nextLayer) {
				return done(err, msg, client, params);
			}
			
			if (err) {
				nextLayer.handleError(err, msg, client, params, next);
			} else {
				nextLayer.handleRequest(msg, client, params, next);
			}
		};
		next();
	}
	/* static dispatch(msg: Message, client: Bot, params: CommandParameters, runCommand:CommandFunction, ...mws: MiddlewareManager[]) {
		return new Promise((resolve, reject)=>{
			let idx = 0, eidx = 0;
			function errorMWcb(_err: DiscordBotError, _msg: Message, _client: Bot, _params: CommandParameters):DiscordBotError {
				if (eidx >= mws.length){
					return _err;
				}
				return mws[eidx++].handleError(_err,_msg,_client,_params,errorMWcb);
			}
			const retErr = (function MWcb(_err: null | DiscordBotError, _msg: Message, _client: Bot, _params: CommandParameters) {
				if (_err) {
					return errorMWcb(<DiscordBotError>_err,_msg,_client,_params)
				}
				if(idx >=mws.length){
					runCommand(_msg,_client,_params);
					return;
				}
				const nextLayer = mws[idx++];
				nextLayer.handle(_msg,_client,_params,MWcb);
			})(null, msg, client, params);
			if(retErr){
				return reject(retErr)
			};
			resolve();
		})
	} */

}

export interface ErrorHandlingFunction {
	(err: DiscordBotError, msg: Message, client: Bot, params: CommandParameters, next: NextFunction): void;
}


export interface MiddlewareFunction {
	(msg: Message, client: Bot, params: CommandParameters, next: NextFunction): void,
}

export interface NextFunction {
	(err?: DiscordBotError): void
}

export interface ErrorCallback {
	(err: DiscordBotError, msg: Message, client: Bot, params: CommandParameters): DiscordBotError
}

export interface DoneCallback {
	(err: DiscordBotError | undefined, msg: Message, client: Bot, params: CommandParameters): void
}