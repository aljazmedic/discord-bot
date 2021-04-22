import { Client, Message, Guild, ReactionEmoji } from "discord.js";
import Command, { CommandFunction, CommandMessage, CommandResponse } from "../Bot/Command";
import { selfDeleteCtrl } from "../Bot/messageControls";
import { GuildDB } from "../Bot/models";
import { getLogger } from '../logger';
import { hasPremission } from "../middleware";
const logger = getLogger(__filename);

const addMethodHandler = (msg: CommandMessage, client: Client, res: CommandResponse) => {
	res.dmReply("AddMethod")
}

export default class Ping extends Command {
	constructor() {
		super("ping");
		this.description = 'replies pong to the sender!';
		this.alias("testp")
		this.before(hasPremission([]))
		this.on("add", addMethodHandler)
	}

	run(msg: CommandMessage, client: Client, res: CommandResponse) {
		//final function
		GuildDB.upsert({
			id: msg.guild?.id,
			name: msg.guild?.name
		})
			.then((created) => {
				res.useModifier('C', (repliedMsg) => selfDeleteCtrl(repliedMsg, client))
				res.useModifier((m) => {
					const coll = m.createReactionCollector(() => true, { time: 10000 })
					coll.on('collect', (reaction: ReactionEmoji) => { logger.debug(reaction) })
				})
				logger.debug(created);/* 
				res.dmReply("DMpong");
				res.msgReply('msgReplyPong - anyone can delete me!') */
				res.channelReply('pong!')
				res.dmReply('private pong :sunglasses:')
			}).catch(logger.error);
	}
};
