import { Message,Client } from 'discord.js';
import MiddlewareManager, {MiddlewareFunction} from './MiddlewareManager';

export default class Command {
	mm: MiddlewareManager;
	name: string;
	aliases: string[];
	runFunction: MiddlewareFunction;
	description: string;
	constructor(name:string[] | string, ...middleware: MiddlewareFunction[]) {
		this.mm = new MiddlewareManager();
		let _name:string[] = !Array.isArray(name) ? [name.toLowerCase()]: name;
		this.name = _name.shift().toLowerCase();
		this.aliases = _name;
		
		const f = middleware.pop();
		this.runFunction = (msg, client, params) => {
			if (params.isError) return; //TODO fix; middleware flags commmand error. Implement error handler middleware
			return f(msg, client, params);
		};
		this.mm.use(...middleware);
		this.description = '';
	}

	setDescription = (description) => {
		this.description = description;
	};

	matches = (token) => {
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

	use = (...middlewares) => {
		return this.mm.use(...middlewares);
	};

	run = (msg, client, params:CommandParameters) => {
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
	args:string[]
}

export interface CommandFunction{
	(msg:Message, client:Client, params:CommandParameters):void,	
}