import { ArgumentParser } from 'argparse';
import { RSA_PSS_SALTLEN_MAX_SIGN } from 'constants';
import { Message, Client, Channel, Role, User, StringResolvable, MessageOptions, MessageAdditions, SplitOptions, APIMessage, MessageAttachment, MessageEmbed } from 'discord.js';
import Bot from '..';
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
	private mwbefore: MiddlewareFunction[];
	private mwafter: ErrorHandlingFunction[];
	constructor(_name: string) {
		this.description = '';
		this._name = _name;
		this._aliases = []
		this.mwbefore = []
		this.mwafter = []
		this.argumentParser = undefined;
		this.mm = new MiddlewareManager();
	}

	getDispatcher = () => {
		//Assure, the stack is executed after the run
		const nextRun =
			(msg: CommandMessage, client: Client, res: CommandResponse, next: NextFunction) => {
				let retVal;
				try {
					retVal = <any>this.run(msg, client, res);
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
		logger.debug("COMMAND STACK: [" + this._name + "] " + this.mm.stack.map(l => l.name || "anon").join("->"))
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

	setDescription = (description: string) => {
		this.description = description;
	};

	matches = (_msg: Message): CommandTrigger | false => {
		if (contentMatchStringRe(_msg, this._name)) {
			return {
				alias: false,
				caller: this._name,
				fn: this
			}
			/* const cmsg = this.createCommandMessage(_msg, { alias: false, caller: this.name })
			return cmsg; */
		}
		if (this.aliases && this.aliases.length) {
			for (let i = 0; i < this.aliases.length; i++) {
				const alias = this.aliases[i];
				if (contentMatchStringRe(_msg, alias)) {
					return {
						alias: true,
						caller: alias,
						fn: this
					};
					/* const cmsg = this.createCommandMessage(_msg, { alias: true, caller: alias })
					return cmsg; */
				}
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

	get name():string{
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


function contentMatchStringRe(msg: Message, s: string) {
	//Checks wether content starts with \bWORD\b <- \b is for word boundary
	const escapedRegex = s.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	const match = msg.content.match(new RegExp(`^\\b${escapedRegex}\\b`, 'i'))
	return match;
}

export type CommandMatch = [CommandMessage, CommandResponse];

export type CommandTrigger = {
	caller: string,
	alias: boolean,
	fn: Command,
}

export type CommandMessage = {
	trigger: CommandTrigger,
	parsed?: {
		[index: string]: any
	}
	args: Argument[],
	voice?: SoundManager
} & Message;


export interface CommandFunction {
	(msg: CommandMessage, client: Bot, res: CommandResponse): void,
}

export type Argument = string | number | Channel | User | Role;