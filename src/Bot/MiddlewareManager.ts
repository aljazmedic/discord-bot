import { exception } from "console";
import { Message } from "discord.js";
import Bot, { DiscordBotError } from ".";
import { getLogger } from "../logger";
import Command, { CommandMessage, CommandTrigger } from "./Command";
import CommandResponse from "./Command/response";
const logger = getLogger(__filename)


export class Layer {
	handle: MiddlewareFunction | ErrorHandlingFunction;
	matches: Transformer<Message, boolean> | Transformer<Message, CommandTrigger | false>;
	name?: string;
	constructor(fn: Layerable, matcher?: Transformer<Message, boolean>) {
		//logger.debug("Layer make " + (fn.name && fn.name));
		if (fn instanceof Command) {
			this.matches = fn.matches
			this.handle = fn.getDispatcher()
			this.name = `Command(${fn.name})`;
		} else {
			this.handle = fn;
			this.matches = matcher || (() => true);
			if (fn.name) this.name = fn.name;
		}
	}

	handleError(err: DiscordBotError, msg: CommandMessage, client: Bot, res: CommandResponse, next: NextFunction) {
		if (this.handle.length !== 5) {
			return next(err)
		}
		const fn = <ErrorHandlingFunction>this.handle;
		try {
			fn(err, msg, client, res, next);
		} catch (e) { next(e) }
	}

	handleRequest(msg: CommandMessage, client: Bot, res: CommandResponse, next: NextFunction) {
		if (this.handle.length > 4) {
			//Not a command  handler
			return next();
		}
		const fn = <MiddlewareFunction>this.handle;
		try {
			fn(msg, client, res, next);
		} catch (e) { next(e) }
	}
}

const layerableToLayer = (layerable: Layerable, matcher?: Transformer<Message>): Layer => {
	if (layerable instanceof Command) {
		return new Layer(layerable);;
	}
	switch (layerable.length) {
		case 4:
		case 5:
			return new Layer(layerable, matcher);
		default:

			throw Error(`Invalid number of function arguments! ${layerable}`);
	}
}

export default class MiddlewareManager {
	stack: Layer[];
	constructor() {
		this.stack = [];
	}

	use(...middlewareFunctions: Layerable[]): void;
	use(filter: Transformer<Message>, ...middlewareFunctions: Layerable[]): void;
	use(filter: Transformer<Message> | Layerable, ...middlewareFunctions: Layerable[]) {
		let matcher: Transformer<Message> | undefined = undefined;
		if (typeof filter === 'function' && filter.length == 1)	//First argument is predicate
			matcher = <Transformer<Message>>filter
		else //first argument is layerable
			middlewareFunctions.unshift(filter);

		this.stack.push(...middlewareFunctions.map((layerable): Layer => layerableToLayer(layerable, matcher)));
	}

	useBefore(...middlewareFunctions: Layerable[]): void;
	useBefore(filter: Transformer<Message>, ...middlewareFunctions: Layerable[]): void;
	useBefore(filter: Transformer<Message> | Layerable, ...middlewareFunctions: Layerable[]) {
		let matcher: Transformer<Message> | undefined = undefined;
		if (typeof filter === 'function' && filter.length == 1)	//First argument is predicate
			matcher = <Transformer<Message>>filter
		else //first argument is layerable
			middlewareFunctions.unshift(filter);

		this.stack.unshift(...middlewareFunctions.map((layerable): Layer => layerableToLayer(layerable, matcher)));
	}

	handle(msg: CommandMessage, client: Bot, res: CommandResponse, done: DoneCallback) {
		let idx = 0;

		const next: NextFunction = (err) => {

			let match: CommandTrigger | boolean = false;
			let nextLayer: Layer | undefined = undefined;
			while (!match) {
				if (idx >= this.stack.length) {
					return done(undefined);
				}

				nextLayer = this.stack[idx++];

				match = nextLayer.matches(msg);
			}

			if (!match || !nextLayer) {
				return done(undefined);
			}

			if (err) {
				nextLayer.handleError(err, msg, client, res, next);
			} else {
				nextLayer.handleRequest(msg, client, res, next);
			}
		};
		next();
	}

}

export interface ErrorHandlingFunction {
	(err: DiscordBotError, msg: CommandMessage, client: Bot, res: CommandResponse, next: NextFunction): void;
}


export interface MiddlewareFunction {
	(msg: CommandMessage, client: Bot, res: CommandResponse, next: NextFunction): void,
}

export interface NextFunction {
	(err?: DiscordBotError): void
}

export interface DoneCallback {
	(err: DiscordBotError | undefined): void
}

export interface Transformer<T, T2 = boolean> {
	(e: T): T2
}

export type Layerable = Command | MiddlewareFunction | ErrorHandlingFunction;
