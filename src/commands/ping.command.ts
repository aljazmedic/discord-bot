import { Client, Message, Guild } from "discord.js";
import Command, { CommandFunction, CommandMessage, CommandResponse } from "../Bot/Command";
import { selfDeleteCtrl } from "../Bot/messageControls";
import { GuildDB } from "../Bot/models";
import { getLogger } from '../logger';
const logger = getLogger(__filename);

export default class Ping extends Command {
	constructor() {
		super();
		this.description = 'replies pong to the sender!';
		this.name = "ping" //name of the command
		this.alias("testp")
	}

	run(msg: CommandMessage, client: Client, res: CommandResponse) {
		//final function
		GuildDB.fetch(msg.guild!)
			.then((created) => {
				res.useModifier('C', (m) => m.react('👏'))
				res.useModifier('C', (repliedMsg) => selfDeleteCtrl(repliedMsg, client, { userAllow: [msg.author.id] }))
				res.useModifier('R', (repliedMsg) => selfDeleteCtrl(repliedMsg, client, ))
				logger.debug(created);
				res.dmReply("DMpong");
				res.channelReply('channelPong')
				res.msgReply('msgReplyPong - anyone can delete me!')
			}).catch(logger.error);
	}
};
