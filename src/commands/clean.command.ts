import { Client, Message } from "discord.js";
import Bot from "../Bot";
import Command, { CommandMessage, CommandResponse } from "../Bot/Command";
import { getLogger } from '../logger';
const logger = getLogger(__filename);

export default class Clean extends Command {
	constructor() {
		super();
		this.name = 'clean'; //name of the command
		this.alias('remove');
	}
	// eslint-disable-next-line no-unused-vars
	run(msg: CommandMessage, client: Bot, res: CommandResponse) {
		const targetChannel = msg.channel;
		targetChannel.messages
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
				console.log(`Deleted #${Object.keys(deleted).length} messages`);
				return res.channelReply(':recycle: Messages deleted!')
			}).then((m) => m.delete({ timeout: 5000 })).catch(logger.error)
	}
};
