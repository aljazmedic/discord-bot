import { Client, Message } from "discord.js";
import Bot from "../Bot";

import Command, { CommandMessage, CommandResponse } from "../Bot/Command";
import { getLogger } from '../logger';
import { hasPremission, Permissions } from "../middleware";
const logger = getLogger(__filename);

export default class Clean extends Command {
	constructor() {
		super('clean');//name of the command
		this.alias('remove');
		this.before(hasPremission("MANAGE_MESSAGES"))
	}
	// eslint-disable-next-line no-unused-vars
	run(msg: CommandMessage, client: Bot, res: CommandResponse) {
		const targetChannel = msg.channel;
		return targetChannel.messages
			//fetch last 50 messages in the channel
			.fetch({ limit: 50 })
			.then((messages) => targetChannel.bulkDelete(
				messages.filter(
					//filter them and pass the result to bulk
					(m: Message) => {
						return (m.author.id == client.user!.id || !!client.isBotCommand(m));
					}),
			))
			.then((deleted) => {
				logger.info(`Deleted ${deleted.size} messages`);
				res.useModifier((m) => m.delete({ timeout: 2000 }))
				return res.channelReply(':recycle: Messages deleted!')
			}).catch((e) => logger.error(e))
	}
};
