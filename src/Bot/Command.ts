import { ArgumentParser } from 'argparse';
import { Message, Client, Channel, Role, User } from 'discord.js';
import Bot from '.';
import SoundManager from '../SoundManager';
import MiddlewareManager, { ErrorHandlingFunction, MiddlewareFunction, NextFunction } from './MiddlewareManager';

export default abstract class Command {
	private mm: MiddlewareManager;
	name: string;
	private _aliases: string[];
	description: string;
	result: number | undefined
	argumentParser: ArgumentParser | undefined
	private mwbefore: MiddlewareFunction[];
	private mwafter: ErrorHandlingFunction[];
	constructor() {
		this.description = '';
		this.name = 'command-' + (typeof this);
		this._aliases = []
		this.mwbefore = []
		this.mwafter = []
		this.argumentParser = undefined;
		this.mm = new MiddlewareManager();
	}

	getDispatcher = () => {
		//Assure, the stack is executed after the run
		const nextRun: MiddlewareFunction = (this.run.length == 4) ?
			<MiddlewareFunction>this.run :
			(msg: Message, client: Client, params: CommandParameters, next: NextFunction) => {
				try {
					this.run(msg, client, params);
				} catch (e) {
					next(e);
					return;
				}
				next();
			}

		this.mm.use(...this.mwbefore, nextRun.bind(this), ...this.mwafter);
		console.log("COMMAND STACK: [" + this.name + "] " + this.mm.stack.map(l => l.name || "anon").join("->"))
		return (msg: Message, client: Bot, params: CommandParameters, next: NextFunction) => {
			return this.mm.handle(msg, client, params, (err?) => {
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

	matches = (token: string): CommandMatch | false => {
		if (this.name == token)
			return {
				call: this.name,
				alias: false,
				fn: this,
			};
		if (this.aliases && this.aliases.length) {
			for (let i = 0; i < this.aliases.length; i++) {
				const alias = this.aliases[i];
				if (alias == token) {
					return {
						call: alias,
						alias: true,
						fn: this,
					};
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

	abstract run(msg: Message, client: Client, params: CommandParameters, next?: NextFunction): void;

	toString() {
		return `Command(${this.name} [${this.aliases.join(', ')}], mw: ${this.mm.stack.length})`;
	}
	getHelpField(bot: Bot) {
		const p = bot.prefix;
		const embedAliases = `Also: *${p}${this.aliases.join(`*, *${p}`)}*\n`;
		const embedDescription = this.description.replace(/[\r\t\n]+/gi, " ").replace(/s+/gi, " ");
		let value = `${this.aliases.length ? embedAliases : ""}${this.description.length ? embedDescription : ""}`;
		if (value == "") {
			value = `**${this.name}** command. Kinda obvious...`;
		}
		return {
			name: `\`${p}${this.name}\``,
			value
		}
	}
}

/* export function setAlias(...aliases:string[]):void{
	//this.c = "Test";
} */

export interface CommandParameters {
	args: Argument[],
	trigger?: CommandMatch,
	//settings: {},
	parsed?: {},
	voice?: SoundManager
	isError?: boolean
}

export type CommandMatch = {
	call: string,
	alias: boolean,
	fn: Command,
};


export interface CommandFunction {
	(msg: Message, client: Bot, params: CommandParameters): void,
}

export type Argument = string | number | Channel | User | Role;