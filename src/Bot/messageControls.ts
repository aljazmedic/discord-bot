import { Client, Collection, Message, MessageReaction } from 'discord.js';
import {CommandFunction, CommandParameters} from './Command'
import { MiddlewareFunction, NextFunction } from './MiddlewareManager';

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
				} = <MessageReaction> collected.first();
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
	const deleteEmojiDict:IEmojiStringDict ={
		'🗑': (msg, client, params) => msg.delete(),
	}
	return msgCtrl(msg, client, deleteEmojiDict);
}

export const selfDeleteMW:MiddlewareFunction =  (msg, client, params, next)=> {
	selfDeleteCtrl(msg, client);
	next();
}

export interface IEmojiStringDict{
	[index:string]:EmojiCommand
}

export interface EmojiCommandParameters{
	trigger:{
		reaction:string,
		collected:Collection<string, MessageReaction>
	},
}

export interface EmojiCommand{
	(msg:Message, client:Client, params:EmojiCommandParameters):void,	
}