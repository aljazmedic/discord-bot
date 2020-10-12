import { Client, Message } from 'discord.js';
import {CommandFunction, CommandParameters} from './Command'
import { NextFunction } from './MiddlewareManager';

export function msgCtrl(msg:Message, client:Client, emojiFnDict:IEmojiStringDict) {
	Object.entries(emojiFnDict).forEach(([emoji, emojiFn]) =>
		msg
			.awaitReactions(
				(reaction, user) =>
					user.id == msg.author.id && reaction.emoji.name == emoji,
				{ max: 1, time: 30000 },
			)
			.then((collected) => {
				const {
					emoji: { name = false },
				} = collected.first();
				if (!name) return;
				emojiFn(msg, client, {
					trigger: { reaction: name, collected },
				});
			}),
	);

	return Promise.all(
		Object.keys(emojiFnDict).map((emoji) =>
			msg
				.react(emoji)
				.catch((err) => Promise.resolve({ status: 'error', ...err })),
		),
	);
}

export function selfDeleteCtrl(msg:Message, client:Client) {
	return msgCtrl(msg, client, {
		'🗑': (msg, client, params) => msg.delete(),
	});
}

export function selfDeleteMW(msg:Message, client:Client, params:CommandParameters, next:NextFunction) {
	selfDeleteCtrl(msg, client);
	next();
}

export interface IEmojiStringDict{
	[index:string]:CommandFunction
}