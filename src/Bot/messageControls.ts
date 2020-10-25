import { Client, Collection, Message, MessageReaction, User } from 'discord.js';
import { getLogger } from '../logger';
import { CommandFunction, CommandMessage, CommandResponse } from './Command'
import { MiddlewareFunction, NextFunction } from './MiddlewareManager';
const logger = getLogger(__filename)

export function addController(msg: Message, client: Client, emojiFnDict: IEmojiStringDict, userWhitelist?: string[]) {
	const userFilter = (u: User) => userWhitelist == undefined || userWhitelist.includes(u.id)

	Object.entries(emojiFnDict).forEach(([emoji, emojiFn]) => {
		const collector = msg.createReactionCollector((reaction, user) =>
			userFilter(user) && reaction.emoji.name == emoji && user.id !== client.user!.id, {
			maxEmojis: 1,
			time: 15000
		})
		collector.on('collect', (reaction, user) => {
			emojiFn(msg, client, {
				trigger: { reaction, user },
			});
		}).on('end', () => {
			const theReaction = msg.reactions.cache.find((r) => r.me && r.emoji.name == emoji)
			if (theReaction) {
				theReaction.remove()
			}
		})
	});

	return Promise.all(
		Object.keys(emojiFnDict).map((emoji) =>
			msg
				.react(emoji)
				.catch((err) => Promise.resolve({ status: 'error', ...err })),
		),
	);
}

export function selfDeleteCtrl(msg: Message, client: Client, options: SelfDeleteOptions = {}) {
	const deleteEmojiDict: IEmojiStringDict = {
		'🗑': (msg, client, params) => msg.delete(),
	}
	return addController(msg, client, deleteEmojiDict, options.userAllow);
}


export interface IEmojiStringDict {
	[index: string]: EmojiCommand
}

export interface EmojiCommandParameters {
	trigger: {
		reaction: MessageReaction,
		user: User
	},
}

export type SelfDeleteOptions = {
	userAllow?: string[];
}

export interface EmojiCommand {
	(msg: Message, client: Client, params: EmojiCommandParameters): void,
}