import { Client, Message } from "discord.js";
import { DiscordBotError } from ".";
import Command, { CommandFunction } from "./Command";
import { CommandParameters } from './Command';

export default class MiddlewareManager {
	stack: MiddlewareFunction[];
	errorStack: ErrorHandlingFunction[];
	numArgs: number = 4;
	constructor() {
		this.stack = [];;
		this.errorStack = [];
	}

	use(...middlewareFunctions: (MiddlewareFunction | ErrorHandlingFunction)[]) {
		middlewareFunctions.forEach((middlewareFunction) => {
			if (typeof middlewareFunction !== "function")
				throw new Error("Middleware must be a function!");
			switch (middlewareFunction.length) {
				case 4:
					this.stack.push(<MiddlewareFunction>middlewareFunction);
					break;
				case 5:
					this.errorStack.push(<ErrorHandlingFunction>middlewareFunction);
					break;
				default:
					throw Error("Invalid number of function arguments!");
			}
		});
	}

	handleError(err: DiscordBotError, msg: Message, client: Client, params: CommandParameters) {
		let idx = 0;
		const next: NextFunction = () => {
			if (idx >= this.stack.length) {
				return;
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


	handle(msg: Message, client: Client, params: CommandParameters, callback: CommandFunction) {
		const finalCallback = (err: DiscordBotError | null, msg: Message, client: Client, params: CommandParameters) => {
			if (err) {
				params.isError = true;
				return this.handleError(err, msg, client, params,);
			} else {
				return callback(msg, client, params);
			}
		};

		let idx = 0;
		const next: NextFunction = (err) => {
			if (err != null) {
				return setImmediate(() => finalCallback(err, msg, client, params));
			}
			if (idx >= this.stack.length) {
				return setImmediate(() => finalCallback(null, msg, client, params));
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


export interface MiddlewareFunction {
	(msg: Message, client: Client, params: CommandParameters, next: NextFunction): void,
}

export interface ErrorHandlingFunction {
	(err: DiscordBotError, msg: Message, client: Client, params: CommandParameters, next: NextFunction): void,
}

export interface NextFunction {
	(err?: DiscordBotError): void
}

export interface ErrorCallback {
	(err: DiscordBotError | null, msg: Message, client: Client, params: CommandParameters, next: NextFunction): void
}