import { Client, Message } from "discord.js";
import Bot from "../Bot";
import Command, { CommandParameters } from "../Bot/Command";

export default class Clean extends Command {
	constructor(){
		super();
		this.name= 'clean', //name of the command
		this.aliases= ['remove']
	}
	// eslint-disable-next-line no-unused-vars
	run(msg:Message, client:Bot, params:CommandParameters){
		const { channel } = msg;
		channel.messages
			.fetch({ limit: 50 })
			.then((messages) => {
				return channel.bulkDelete(
					messages.filter(
						(m:Message) =>
							m.author.id == client.user?.id ||
							!!client.isBotCommand(m.content),
					),
				);
			})
			.then((msgs) => {
				if (msgs) {
					msgs.forEach((e) => console.log(`${e}`));
				}
				console.log('deleted ' + (Object.keys(msgs).length || 0));
				return channel.send(':recycle: Messages deleted!');
			})
			.then((msg:Message) => {
				msg.delete({ timeout: 5000 });
			})
			.catch(console.error);
	}
};
