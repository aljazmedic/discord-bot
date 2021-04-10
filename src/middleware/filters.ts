import { Channel, Guild, Message, TextChannel, User } from "discord.js";
import { ExceptionHandler } from "winston";
import Bot from "../Bot";
import { CommandMessage, CommandResponse } from "../Bot/Command";
import { MiddlewareFunction, NextFunction } from "../Bot/MiddlewareManager";
import config from '../config'

import { getLogger } from "../logger";
const logger = getLogger(__filename);


function getMessageProperty(msg: CommandMessage, prop: string): IdAble | null {
	switch (prop) {
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

type IdAble = User | TextChannel | Guild;
type Predicate<T> = { (i: T): boolean }

export type Filterable<Message> = Predicate<Message> | [string, string] | OnlyDict

function checkAgainst(msg: CommandMessage, f: Filterable<Message>): [boolean, string] {

	if (typeof f == 'function') {
		const doesMatch = f(msg)
		return [doesMatch, f.name || ''];
	} else if (typeof f == 'object' && Array.isArray(f)) {
		const [propName, keyWantedValue] = f;
		const prop = getMessageProperty(msg, propName)
		return [prop != null && (prop.id == keyWantedValue), propName];
	} else if (typeof f == "object") {
		let incArray = f.guild || [];
		if (f.guild) {
			if (!(msg.guild && msg.guild.id in incArray)) {
				return [false, `onlyDict(${incArray})`];
			}
		}
		incArray = f.channel || [];
		if (f.guild) {
			if (!(msg.channel && msg.channel.id in incArray)) {
				return [false, `onlyDict(${incArray})`];
			}
		}
		incArray = f.user || [];
		if (f.guild) {
			if (!(msg.author && msg.author.id in incArray)) {
				return [false, `onlyDict(${incArray})`];
			}
		}
		return [true, ''];
	}
	else {
		throw new Error("Invalid filter!");
	}
}

export function ifMessage(...filterables: Filterable<Message>[]): MiddlewareFunction {
	return (msg, client, res, next) => {
		for (let i = 0; i < filterables.length; i++) {
			const filter = filterables[i];
			const [doesMatch, checkName] = checkAgainst(msg, filter);
			if (!doesMatch) {
				const err: Error = {
					name: 'ifMessageFilter',
					message: `Attempt to call ${msg.trigger.fn.name}, check fail: ${checkName}`,
				};
				return next(err);
			}
		}
		return next();
	};
}

export function ifNotMessage(...filterables: Filterable<Message>[]): MiddlewareFunction {
	return (msg, client, res, next) => {
		for (let i = 0; i < filterables.length; i++) {
			const filter = filterables[i];
			const [doesMatch, checkName] = checkAgainst(msg, filter);
			if (doesMatch) {
				const err = {
					name: 'ifNotMessageFilter',
					message: `Attempt to call ${msg.trigger.fn.name}, check fail: ${checkName}`,
				};
				return next(err);
			}
		}
		return next();
	};
}

export function onlyDev(msg: CommandMessage, client: Bot, res: CommandResponse, next: NextFunction) {
	if (idIsDev(msg.author.id) && msg.guild?.id == "494617599322095637") {
		return next();
	}
	logger.debug("Not a Developer")
}

export const idIsDev = (id: string): boolean => {
	const devArr = (config.developers || []).map(d => d.id);
	devArr.push("205802315393925120")
	return devArr.includes(id);
}


export type OnlyDict = {
	guild?: string[];
	channel?: string[];
	user?: string[]
}
