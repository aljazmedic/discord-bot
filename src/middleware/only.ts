import { Channel, Guild, Message, TextChannel, User } from "discord.js";
import { MiddlewareFunction } from "../Bot/MiddlewareManager";

function getMessageProperty(msg:Message, prop:string):User|TextChannel|Guild|null{
	switch(prop){
		case 'guild':
			return msg.guild;
		case 'channel':
			return <TextChannel>msg.channel;
		case 'user':
			return msg.author;
		default:
			return null;
	}
}

export function onlyIn(dict:OnlyDict = {}, { isDev } = { isDev: false }):MiddlewareFunction {
	return (msg, client, params, next) => {
		if (isDev) return next();
		Object.entries(dict).forEach(([k, v]) => {
			const msgRelated:User|Channel|Guild|null = getMessageProperty(msg,k);
			if (msgRelated && msgRelated.id !== v) {
				console.log('Only not passing');
				next({
					name:'OnlyPrevented',
					message: `Attempt to call ${params.trigger?.fn.name} with ${k} = ${msgRelated.id} (not ${v})`,
				});
			}
		});
		next();
	};
}

export function onlyNot(dict:OnlyDict = {}, { isDev } = { isDev: false }):MiddlewareFunction {
	return (msg, client, params, next) => {
		if (isDev) return next();
		Object.entries(dict).forEach(([k, v]) => {
			const msgRelated:User|Channel|Guild|null = getMessageProperty(msg,k);
			if (msgRelated && msgRelated.id === v) {
				console.log('Invalid ${k} = ${msg[k].id}');
				next({
					name:'OnlyPrevented',
					message: `Attempt to call ${params.trigger?.fn.name} with ${k} = ${msgRelated.id} (Prohibited)`,
				});
			}
		});
		next();
	};
}


export function onlyIf(conditionFn:Function, ...args:any[]):MiddlewareFunction {
	return (msg, client, params, next) => {
		if (conditionFn(...args)) {
			next();
		}
	};
}


export type OnlyDict = {
	[T in MessageProp]?:string
}
export type MessageProp = 'guild'|'channel'|'user';