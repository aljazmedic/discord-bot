import { ArgumentParser } from 'argparse';
import { RSA_PSS_SALTLEN_MAX_SIGN } from 'constants';
import { Message, Client, Channel, Role, User, StringResolvable, MessageOptions, MessageAdditions, SplitOptions, APIMessage, MessageAttachment, MessageEmbed, TextChannel, NewsChannel } from 'discord.js';
import Bot, { msgCtrl } from '..';
import { getLogger } from '../../logger';
import SoundManager from '../../SoundManager';
import MiddlewareManager, { ErrorHandlingFunction, Layer, MiddlewareFunction, NextFunction } from '../MiddlewareManager';
import CommandResponse from './response';

export { CommandResponse };
const logger = getLogger(__filename)

export default abstract class Command {
	private mm: MiddlewareManager;
	_name: string;
	private _aliases: string[];
	description: string;
	result: number | undefined
	argumentParser: ArgumentParser | undefined
	private precompiledRe?: PrecompiledRegex;
	private mwbefore: MiddlewareFunction[];
	private mwafter: ErrorHandlingFunction[];
	methods: MethodsDictionary;
	constructor(_name: string) {
		this.description = '';
		this._name = _name;
		this._aliases = []
		this.mwbefore = []
		this.mwafter = []
		this.argumentParser = undefined;
		this.mm = new MiddlewareManager();
		this.precompiledRe = undefined;
		this.methods = {}
	}

	on(method: string, run: MethodRun) {
		if (method in this.methods) {
			throw new Error("Method already exits!");
		}
		this.methods[method] = run;
	}

	init = () => {
		this.precompiledRe = this.compileRegex();
	}

	getDispatcher = () => {
		//Assure, the stack is executed after the run
		const nextRun =
			(msg: CommandMessage, client: Bot, res: CommandResponse, next: NextFunction) => {
				let retVal;
				try {
					//Try to find specific command method to run
					const mtd = msg.trigger.method;
					if (mtd && (mtd in this.methods)) {
						retVal = <any>this.methods[mtd](msg, client, res)
					} else {
						retVal = <any>this.run(msg, client, res);
					}
				} catch (e) {
					next(e);
					return;
				}
				if (retVal instanceof Promise) {
					retVal.then(() => next()).catch(e => next(e))
				} else {
					next();
				}
			}

		this.mm.use(...this.mwbefore, nextRun.bind(this), ...this.mwafter);
		//logger.debug("COMMAND STACK: [" + this._name + "] " + this.mm.stack.map(l => l.name || "anon").join("->"))
		return (msg: CommandMessage, client: Bot, res: CommandResponse, next: NextFunction) => {
			return this.mm.handle(msg, client, res, (err?) => {
				if (err) {
					next(err);
				} else {
					next();
				}
			})
		};
	}

	compileRegex = (): PrecompiledRegex => {
		return {
			main: getMessageMatcher(this.name),
			aliases: this.aliases.map(v => getMessageMatcher(v))
		}
	}

	setDescription = (description: string) => {
		this.description = description;
	};

	matches = (_msg: Message): CommandTrigger | false => {
		if (!this.precompiledRe) {
			this.precompiledRe = this.compileRegex();
		}
		const nameMatch = this.precompiledRe.main(_msg);
		if (nameMatch) {
			return {
				alias: false,
				caller: this._name,
				fn: this,
				method: nameMatch[2]
			}
		}
		for (let i = 0; i < this.precompiledRe.aliases.length; i++) {
			const aliasRe = this.precompiledRe.aliases[i];
			if (aliasRe(_msg)) {
				return {
					alias: true,
					caller: aliasRe.callerName,
					fn: this
				};
			}
		}
		return false;
	};

	before = (...middlewares: (MiddlewareFunction)[]) => {
		return this.mwbefore.push(...middlewares);
	};

	after = (...middlewares: ErrorHandlingFunction[]) => {
		return this.mwafter.push(...middlewares);
	}

	alias = (...aliases: string[]) => {
		this._aliases.push(...aliases)
	}

	get aliases(): string[] {
		return this._aliases;
	}

	get name(): string {
		return this._name;
	}

	abstract run(msg: CommandMessage, client: Client, res: CommandResponse, next?: NextFunction): void;

	toString() {
		return `Command(${this._name} [${this.aliases.join(', ')}], mw: ${this.mm.stack.length})`;
	}
	getHelpField(bot: Bot) {
		const p = bot.prefix;
		const embedAliases = `Also: *${p}${this.aliases.join(`*, *${p}`)}*\n`;
		const embedDescription = this.description.replace(/[\t\n]+/gi, " ").replace(/\s+/gi, " ");
		let value = `${this.aliases.length ? embedAliases : ""}${this.description.length ? embedDescription : ""}`;
		if (value == "") {
			value = `**${this._name}** command. Kinda obvious...`;
		}
		return {
			name: `\`${p}${this._name}\``,
			value
		}
	}
}

function getMessageMatcher(s: string): MessageMatchFunction {
	const escapedRegex = s.trim().replace(/[-\/\\^$*+!?.()\|[\]{}]/g, '\\$&');
	const compiled = new RegExp(`^\\b(${escapedRegex})(?:\\:(\\w+))?\\b`, 'i');
	const fn = (m: Message) => {
		return m.content.match(compiled);
	}
	fn.callerName = s;
	return fn;
}

export type CommandTrigger = {
	caller: string,
	alias: boolean,
	fn: Command,
	method?: string
}

export type CommandMessage = {
	trigger: CommandTrigger,
	parsed?: {
		[index: string]: any
	}
	args: Argument[],
	voice?: SoundManager,
} & Message & {
	channel: TextChannel | NewsChannel
};

type MessageMatchFunction = {
	(msg: Message): RegExpMatchArray | null,
	callerName: string
};

type PrecompiledRegex = {
	main: MessageMatchFunction,
	aliases: MessageMatchFunction[]
}
export type MethodRun = { (msg: CommandMessage, client: Bot, res: CommandResponse, next?: NextFunction): void }
type MethodsDictionary = {
	[index: string]: MethodRun
}
export interface CommandFunction {
	(msg: CommandMessage, client: Bot, res: CommandResponse): void,
}

export type Argument = string | number | Channel | User | Role;