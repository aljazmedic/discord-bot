import { Client, Message, Guild } from "discord.js";
import Command, { CommandFunction, CommandParameters } from "../Bot/Command";
import { GuildDB } from "../Bot/models";

export default class Ping extends Command {
	constructor() {
		super();
		this.description = '';
		this.name = "ping" //name of the command
		this.aliases = ["testp"]
		//this.setName("ping", "testp");
	}

	run(msg: Message, client: Client, params: CommandParameters) {
		//final function
		console.log(params.context?.get('ram-id:5'))
		GuildDB.create(<Guild>msg.guild).then((created) => {
			console.log(created);
			return msg.reply("pong");
		}).catch(err => {
			console.error(err);
		});
	}
};
