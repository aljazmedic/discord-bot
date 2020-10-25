/* eslint-disable no-unused-vars */
import {ArgumentParser} from 'argparse';
import { Channel, Client, Message, Role, User } from 'discord.js';
import { CommandMessage } from '../Bot/Command';
import { MiddlewareFunction } from '../Bot/MiddlewareManager';

export function parseArgs(argparser:ArgumentParser):MiddlewareFunction {
	//with argparser parse the args of a command
	return (msg, client, res, next) => {
		try{
			msg.parsed = argparser.parse_known_args(<string[]>msg.args)[0];
		}catch(e){
			next(e);
		}
		next();
	};
}

export const parseNumbers: MiddlewareFunction = (msg, client, res, next) => {
	// Middleware that parses args
	msg.args = msg.args.map((part) => {
		return (typeof part == 'object') ? part :
			typeof part == 'string' && !Number.isNaN(Number(part)) ? parseFloat(part) : part;
	});
	next();
}



function getEntityFromText(msg:CommandMessage, client: Client, mention: string): Channel | User | Role | undefined {
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
	const _args = msg.args;
	_args.forEach((arg, idx: number) => {
		const u = getEntityFromText(msg, client, <string>arg);
		if (u) {
			msg.args[idx] = u;
		}
	});
	next();
}