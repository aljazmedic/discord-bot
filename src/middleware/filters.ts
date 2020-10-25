import { Channel, Guild, Message, TextChannel, User } from "discord.js";
import { CommandMessage } from "../Bot/Command";
import { MiddlewareFunction } from "../Bot/MiddlewareManager";
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

export type Filterable<Message> = Predicate<Message> | [string, string]

function checkAgainst(obj: CommandMessage, f: Filterable<Message>): [boolean, string] {

	if (typeof f == 'function') {
		const doesMatch = f(obj)
		return [doesMatch, f.name || ''];
	} else {
		const [propName, keyWantedValue] = f;
		const prop = getMessageProperty(obj, propName)
		return [prop != null && (prop.id == keyWantedValue), propName];
	}
}

export function onlyWhen(...filterables: Filterable<Message>[]): MiddlewareFunction {
	return (msg, client, res, next) => {
		filterables.forEach((f) => {
			const [doesMatch, checkName] = checkAgainst(msg, f);
			if (!doesMatch) {
				const err = {
					name: 'OnlyWhenPrevented',
					message: `Attempt to call ${msg.trigger.fn.name}, check fail: ${checkName}`,
				};
				logger.error(err);
				next(err);
			}
		});
		next();
	};
}

export function exceptWhen(...filterables: Filterable<Message>[]): MiddlewareFunction {
	return (msg, client, res, next) => {
		filterables.forEach((f) => {
			const [doesMatch, checkName] = checkAgainst(msg, f);
			if (doesMatch) {
				const err = {
					name: 'ExceptWhenPrevented',
					message: `Attempt to call ${msg.trigger.fn.name}, check fail: ${checkName}`,
				};
				logger.error(err);
				next(err);
			}
		});
		next();
	};
}


export type OnlyDict = {
	[T in MessageProp]?: string
}
export type MessageProp = 'guild' | 'channel' | 'user';