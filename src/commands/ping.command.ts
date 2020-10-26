import { Client, Message, Guild, ReactionEmoji } from "discord.js";
import Command, { CommandFunction, CommandMessage, CommandResponse } from "../Bot/Command";
import { selfDeleteCtrl } from "../Bot/messageControls";
import { GuildDB } from "../Bot/models";
import { getLogger } from '../logger';
const logger = getLogger(__filename);

export default class Ping extends Command {
	constructor() {
		super("ping");
		this.description = 'replies pong to the sender!';

		this.alias("testp")
	}

	run(msg: CommandMessage, client: Client, res: CommandResponse) {
		//final function
		GuildDB.fetch(msg.guild!)
			.then((created) => {
				res.useModifier('C', (m) => m.react('👏'))
				res.useModifier('C', (repliedMsg) => selfDeleteCtrl(repliedMsg, client))
				res.useModifier('R', (repliedMsg) => selfDeleteCtrl(repliedMsg, client,))
				res.useModifier((m) => {
					const coll = m.createReactionCollector(() => true)
					coll.on('collect', (reaction: ReactionEmoji) => { console.log(reaction) })
				})
				logger.debug(created);/* 
				res.dmReply("DMpong");
				res.msgReply('msgReplyPong - anyone can delete me!') */
				res.channelReply('channelPong')
			}).catch(logger.error);
	}
};
