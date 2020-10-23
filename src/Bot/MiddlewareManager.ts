import { exception } from "console";
import { Message } from "discord.js";
import Bot, { DiscordBotError } from ".";
import Command, { CommandFunction, CommandMatch, CommandParameters } from "./Command";

class Layer {
	handle: MiddlewareFunction | ErrorHandlingFunction;
	matches: Transformer<Message, boolean> | Transformer<Message, CommandMatch | boolean>;
	name?: string;
	constructor(fn: Layerable, matcher?: Transformer<Message>) {
		console.log("Layer make " + (fn.name && fn.name));
		if (fn instanceof Command) {
			this.matches = (msg: Message) => {
				const args = msg.content.split(' ');
				if (args.length == 0) return false;
				return fn.matches(args[0].trim()) || false;
			}
			this.handle = fn.getDispatcher()
			this.name = `Command(${fn.name})`;
		} else {
			this.handle = fn;
			this.matches = matcher || (() => true);
			if (fn.name) this.name = fn.name;
		}
	}

	handleError(err: DiscordBotError, msg: Message, client: Bot, params: CommandParameters, next: NextFunction) {
		if (this.handle.length !== 5) {
			return next(err)
		}
		const fn = <ErrorHandlingFunction>this.handle;
		try {
			fn(err, msg, client, params, next);
		} catch (e) { next(e) }
	}

	handleRequest(msg: Message, client: Bot, params: CommandParameters, next: NextFunction) {
		if (this.handle.length > 4) {
			//Not a command  handler
			return next();
		}
		const fn = <MiddlewareFunction>this.handle;
		try {
			fn(msg, client, params, next);
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

	handle(msg: Message, client: Bot, params: CommandParameters, done: DoneCallback) {
		let idx = 0;

		/** DEBUG PURPOSES 
		const frames: { name: string[], applicable: boolean[] } = {name:[],applicable:[]}*/
		const next: NextFunction = (err) => {

			let match: CommandMatch | boolean = false;
			let nextLayer: Layer | undefined = undefined;
			while (!match) {
				if (idx >= this.stack.length) {
					return done(undefined);
				}

				nextLayer = this.stack[idx++];

				match = nextLayer.matches(msg);

				/** DEBUG PURPOSES 
				frames.name.push(nextLayer.name!);
				frames.applicable.push(!!match);*/
			}
			if (!nextLayer) {
				return done(undefined);
			}

			if (!(typeof match == 'boolean')) {
				params.trigger = match;
			}

			if (err) {
				nextLayer.handleError(err, msg, client, params, next);
			} else {
				nextLayer.handleRequest(msg, client, params, next);
			}
		};
		next();
		/** DEBUG PURPOSES 
		console.table(frames) */
	}

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

export interface DoneCallback {
	(err: DiscordBotError | undefined): void
}

export interface Transformer<T, T2 = boolean> {
	(e: T): T2
}


export type Layerable = Command | MiddlewareFunction | ErrorHandlingFunction;