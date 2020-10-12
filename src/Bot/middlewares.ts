import { Client, Message } from 'discord.js';
import { CommandParameters } from './Command';
import { ContextManager } from './ContextManager';
import { NextFunction } from './MiddlewareManager';

function getEntityFromText(msg:Message, client:Client, mention) {
	const userMatch = mention.match(/^<@!?(\d+)>$/);
	if (userMatch) return msg.mentions.users.get(userMatch[1]);

	const roleMatch = mention.match(/^<@&(\d+)>$/);
	if (roleMatch) return msg.mentions.roles.get(roleMatch[1]);

	const channelMatch = mention.match(/^<#(\d+)>$/);
	if (channelMatch) return client.channels.cache.get(channelMatch[1]);

	return null;
}

export function parseIdsToObjects(msg:Message, client:Client, params:CommandParameters, next:NextFunction) {
	// Middleware that parses args with cache
	params.entities = {};
	const args = params.args || [];
	args.forEach((arg:string | number | undefined, idx:number) => {
		const u = getEntityFromText(msg, client, arg);
		if (u) {
			params.args[idx] = params.entities[idx] = u;
		}
	});
	next();
}

export function parseNumbers(msg:Message, client:Client, params:CommandParameters, next:NextFunction) {
	// Middleware that parses args
	params.args = params.args.map((part) => {
		return isNaN(part) || typeof part == 'object' ? part : parseFloat(part);
	});
	next();
}

export function withContext(contextMgr) {
	return (msg, client:Client, params, next) => {
		params.context = contextMgr.forMessage(msg);
		next();
	};
}
