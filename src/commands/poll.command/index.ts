/* eslint-disable no-unused-vars */

import { Client, Message, ReactionEmoji, User } from 'discord.js';
import Command, { Argument, CommandMessage, CommandResponse } from '../../Bot/Command';
import { onlyDev, parseNumbers } from '../../middleware';

function removeElement(arr: any[], e: any) {
	const idx = arr.indexOf(e);
	if (idx > -1) {
		arr.splice(idx, 1);
	}
	return arr;
}


export default class Poll extends Command {
	constructor() {
		super('poll');
		this.alias('vote')
		this.description = 'Allows people to vote democratically'
		this.before(onlyDev)
	}

	run(msg: CommandMessage, client: Client, res: CommandResponse) {
		//const options = msg.args;
		const options:VoteOptions = {};

		const allContent = msg.args.join(" ").replace(/\s+:/g,":");
		const splitter= /((?:[^ \\]|\\ )+)/g;
		const splitted = allContent.match(splitter);
		if(splitted == null){
			return res.msgReply("Give me something to poll people about!");
		}
		console.log(splitted);
		for(let i = 0; i < splitted.length; i++){
			const parts = splitted[i].split(":");
			const emojiUc:string = parts.shift() || "";
			const optionName = parts.join(":")
			console.log(emojiUc);
			const res1 = client.emojis.resolveIdentifier(emojiUc) || "";
			console.log(res1)
			console.log(
				client.emojis.cache.get(res1),
				client.emojis.resolve(res1),
				
			)
		}

		console.log(options)
		





		res.useModifier((msg) => {
			const collector = msg.createReactionCollector((reaction: ReactionEmoji, user: User) => {
				return !user.bot;
			})
			const voted: VoteDict = {};
			Object.keys(options).forEach((a) => { voted[a.toString()] = []; })

			collector.on('collect', (reaction, user) => {
				//Check if already voted:
				Object.entries(voted).forEach(([checkVoteId, people]) => {
					removeElement(people, user.id);
				})
				const voteId = reaction.emoji.identifier;
				voted[voteId].push(user.id);
				console.log(voted);
			});

			collector.on('remove', (reaction, user) => {
				const voteId = reaction.emoji.identifier;
				removeElement(voted[voteId], user.id);
				console.log(voted);
			});
		})
		res.channelReply(`Vote me onnn \:poop: :poop:`);
	}
};

type VoteDict = {
	[key: string]: string[]
}
type VoteOptions = {
	[key:string]: string
}