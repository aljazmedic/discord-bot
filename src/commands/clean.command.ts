import { Client, Message } from "discord.js";
import Bot from "../Bot";
import Command, { CommandParameters } from "../Bot/Command";

export default class Clean extends Command {
	constructor() {
		super();
		this.name = 'clean'; //name of the command
		this.alias('remove');
	}
	// eslint-disable-next-line no-unused-vars
	run(msg: Message, client: Bot, params: CommandParameters) {
		const targetChannel = msg.channel;
		targetChannel.messages
			//fetch last 50 messages in the channel
			.fetch({ limit: 50 })
			.then((messages) => targetChannel.bulkDelete(
				messages.filter(
					//filter them and pass the result to bulk
					(m: Message) => {
						const msgParts = m.content.split(' ');
						if (msgParts.length > 0) return false;
						return (m.author.id == client.user?.id || !!client.isBotCommand(msgParts[0]));
					}),
			))
			.then((deleted) => {
				console.log(`Deleted #${deleted.keys.length} messages`);
				return targetChannel.send(':recycle: Messages deleted!')
			})
			.then((msg: Message) => msg.delete({ timeout: 5000 })) //Delete response after 5seconds
			.catch(console.error);
	}
};
