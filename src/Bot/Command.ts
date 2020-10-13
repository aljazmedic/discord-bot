import { Message,Client, Channel, Role,User } from 'discord.js';
import Context from './Context';
import { EmojiCommandParameters } from './messageControls';
import MiddlewareManager, {MiddlewareFunction} from './MiddlewareManager';

export default class Command {
	mm: MiddlewareManager;
	name: string;
	aliases: string[];
	runFunction: CommandFunction;
	description: string;
	constructor(name:string[] | string, ...middleware: (MiddlewareFunction|CommandFunction)[]) {
		this.mm = new MiddlewareManager();
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
	}

	setDescription = (description:string) => {
		this.description = description;
	};

	matches = (token:string):CommandMatch|undefined => {
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

	use = (...middlewares:(MiddlewareFunction|CommandFunction)[]) => {
		return this.mm.use(...middlewares);
	};

	run:CommandFunction = (msg, client, params) => {
		//Leave arrow so this is bind
		return this.mm.handle(msg, client, params, this.runFunction);
	};
	toString() {
		return `Command(${this.name} [${this.aliases.join(', ')}], mw: ${
			this.mm.stack.length
		})`;
	}
	getHelpField(){
		return { 
			name:`${this.name}`,
			value:`Also: (${this.aliases.join('|')})${this.description && ("\n"+this.description)}`
		}
	}
}

export interface CommandParameters{
	context?: Context;
	args:Argument[],
	entities:{[index:number]:Channel|User|Role},
	trigger:CommandMatch,
	settings:{

	},
	isError?:boolean
}

export type CommandMatch = {
	call: string,
	alias: boolean,
	fn: Command,
};


export interface CommandFunction{
	(msg:Message, client:Client, params:CommandParameters):void,	
}

export type Argument = string | number | Channel | User | Role;