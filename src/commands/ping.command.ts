import { Client, Message, Guild } from "discord.js";
import Command, { CommandFunction, CommandParameters } from "../Bot/Command";
import { GuildDB } from "../Bot/models";

export default class Ping extends Command {
	constructor() {
		super();
		this.description = 'replies pong to the sender!';
		this.name = "ping" //name of the command
		this.alias("testp")
	}

	run(msg: Message, client: Client, params: CommandParameters) {
		//final function
		GuildDB.fetch(msg.guild!)
		.then((created) => {
			console.log(created);
			return msg.reply("pong");
		}).catch(err => {
			console.error(err);
		});
	}
};
