import { Channel, Guild, Message, TextChannel, User } from "discord.js";
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
	} else {
		//dictionary

		const { guild = [], channel = [], user = [] } = f;
		if (!(guild.length && guild.includes(msg.guild!.id))) {
			return [false, `dict(guild)`];
		}
		if (!(user.length && user.includes(msg.author.id))) {
			return [false, `dict(user)`];
		}
		if (!(channel.length && channel.includes(msg.channel!.id))) {
			return [false, `dict(channel)`];
		}
		return [true, 'dict'];
	}
}

export function onlyWhen(...filterables: Filterable<Message>[]): MiddlewareFunction {
	return (msg, client, res, next) => {
		for (let i = 0; i < filterables.length; i++) {
			const filter = filterables[i];
			const [doesMatch, checkName] = checkAgainst(msg, filter);
			if (!doesMatch) {
				const err = {
					name: 'ExceptWhenPrevented',
					message: `Attempt to call ${msg.trigger.fn.name}, check fail: ${checkName}`,
				};
				logger.error(err);
				return next(err);
			}
		}
		return next();
	};
}

export function exceptWhen(...filterables: Filterable<Message>[]): MiddlewareFunction {
	return (msg, client, res, next) => {
		for (let i = 0; i < filterables.length; i++) {
			const filter = filterables[i];
			const [doesMatch, checkName] = checkAgainst(msg, filter);
			if (doesMatch) {
				const err = {
					name: 'ExceptWhenPrevented',
					message: `Attempt to call ${msg.trigger.fn.name}, check fail: ${checkName}`,
				};
				logger.error(err);
				return next(err);
			}
		}
		return next();
	};
}

export function onlyDev(msg: CommandMessage, client: Bot, res: CommandResponse, next: NextFunction) {
	if (idIsDev(msg.author.id)) {
		next();
	}
}

export const idIsDev = (id: string): boolean => {
	const devArr = (config.developers || []).map(d => d.id);
	return devArr.includes(id);
}


export type OnlyDict = {
	guild?: string[];
	channel?: string[];
	user?: string[]
}
