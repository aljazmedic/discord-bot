import { ArgumentParser } from 'argparse';
import { Message, Client, Channel, Role, User } from 'discord.js';
import Bot from '.';
import SoundManager from '../SoundManager';
import Context from './Context';
import { EmojiCommandParameters } from './messageControls';
import MiddlewareManager, { DoneCallback, MiddlewareFunction } from './MiddlewareManager';

export default abstract class Command {
	mm: MiddlewareManager;
	name: string;
	aliases: string[];
	description: string;
	result: number | undefined
	argumentParser: ArgumentParser | undefined
	constructor() {
		this.mm = new MiddlewareManager();
		this.description = '';
		this.name = 'command-' + (typeof this);
		this.aliases = []
		this.argumentParser = undefined;
	}
	/* constructor(name:string[] | string, ...middleware: (MiddlewareFunction|CommandFunction)[]) {
		
		let _name:string[] = !Array.isArray(name) ? [name.toLowerCase()]: name;
		this.name = <string> _name.shift()?.toLowerCase();
		this.aliases = _name;
		
		const f:CommandFunction = <CommandFunction>middleware.pop();
		this.runFunction = (msg:Message, client:Client, params:CommandParameters) => {
			if (params.isError) return; //TODO fix; middleware flags commmand error. Implement error handler middleware
			return f(msg, client, params);
		};
		this.mm.use(...middleware);
		this.description = '';
	} */

	setDescription = (description: string) => {
		this.description = description;
	};

	matches = (token: string): CommandMatch | undefined => {
		if (this.name == token)
			return {
				call: this.name,
				alias: false,
				fn: this,
			};
		if (this.aliases && this.aliases.length) {
			for (let i = 0; i < this.aliases.length; i++) {
				const alias = this.aliases[i];
				if (alias.startsWith(token)) {
					return {
						call: alias,
						alias: true,
						fn: this,
					};
				}
			}
		}
		return undefined;
	};


	toDone(): DoneCallback {
		return (err, msg, client, params) => {
			if(err){
				console.log("PRE COMMAND ERROR");
				console.error(err);
				return;
			}
			this.mm.handle(msg, client, params, (_err, msg, client, params) => {
				if (_err) {
					console.log("IN COMMAND ERROR");
					console.error(_err);
					return;
				}
				this.run(msg,client,params);
			});
		};
	}


	use = (...middlewares: (MiddlewareFunction)[]) => {
		return this.mm.use(...middlewares);
	};

	abstract run(msg: Message, client: Client, params: CommandParameters): void;

	toString() {
		return `Command(${this.name} [${this.aliases.join(', ')}], mw: ${this.mm.stack.length})`;
	}
	getHelpField() {
		return {
			name: `${this.name}`,
			value: `Also: (${this.aliases.join('|')})${this.description && ("\n" + this.description)}`
		}
	}
}

/* export function setAlias(...aliases:string[]):void{
	//this.c = "Test";
} */

export interface CommandParameters {
	context?: Context;
	args: Argument[],
	entities: {
		[index: number]: Channel | User | Role
	},
	trigger: CommandMatch,
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