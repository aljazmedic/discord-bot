import { Channel, Client, Message, Role, User } from 'discord.js';
import { CommandParameters } from './Command';
import ContextManager from './ContextManager';
import { MiddlewareFunction, NextFunction } from './MiddlewareManager';

function getEntityFromText(msg: Message, client: Client, mention: string): Channel | User | Role | undefined {
	const userMatch = mention.match(/^<@!?(\d+)>$/);
	if (userMatch) return msg.mentions.users.get(userMatch[1]);

	const roleMatch = mention.match(/^<@&(\d+)>$/);
	if (roleMatch) return msg.mentions.roles.get(roleMatch[1]);

	const channelMatch = mention.match(/^<#(\d+)>$/);
	if (channelMatch) return client.channels.cache.get(channelMatch[1]);

	return undefined;
}

export const parseIdsToObjects: MiddlewareFunction = (msg, client, params, next) => {
	// Middleware that parses args with cache
	params.entities = {};
	const _args = params.args;
	_args.forEach((arg, idx: number) => {
		const u = getEntityFromText(msg, client, <string>arg);
		if (u) {
			params.args[idx] = u;
			params.entities[idx] = u;
		}
	});
	next();
}

export const parseNumbers: MiddlewareFunction = (msg, client, params, next) => {
	// Middleware that parses args
	params.args = params.args.map((part) => {
		return (typeof part == 'object') ? part :
			typeof part == 'string' && !Number.isNaN(Number(part)) ? parseFloat(part) : part;
	});
	next();
}

export function withContext(contextMgr: ContextManager): MiddlewareFunction {
	return (msg, client: Client, params, next) => {
		params.context = contextMgr.forMessage(msg);
		next();
	};
}
