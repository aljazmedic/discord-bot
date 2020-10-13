import { Message } from "discord.js";
import { ContextManager } from ".";
import { ContextIgnoreDict } from "./ContextManager";

export default class Context {
	msg: Message;
	cm: ContextManager;
	constructor(msg: Message, cm: ContextManager) {
		this.msg = msg;
		this.cm = cm;
	}

	get(name:string, options:ContextIgnoreDict={}) {
		return this.cm.getContext(this.msg, name, options);
    }
    
	async create(name: any, data: any, options:ContextIgnoreDict={}) {
		return this.cm.createContext(this.msg, name, data, options);
	}

	async set(name: string, key: string, value: any, options:ContextIgnoreDict={}) {
		return this.cm.set(this.msg, name, key, value, options);
	}
}
