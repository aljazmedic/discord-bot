import { Client, Message, ClientOptions } from 'discord.js';
import MiddlewareManager, { ErrorHandlingFunction, MiddlewareFunction } from './MiddlewareManager';
import { msgCtrl } from './messageControls';
import Command, { CommandMatch } from './Command';


export { Command, MiddlewareManager, msgCtrl };
import { sequelize } from './models';

const FORBIDDEN_NAMES = ['help', 'settings']

export default class Bot extends Client {
	prefix: string;
	private mm: MiddlewareManager;
	_commands: Command[]; //commands array
	_commandNames: string[]; //Checking the names dont overlap

	constructor(botOptions: BotOptions) {
		super(botOptions);
		this.prefix = botOptions.prefix;
		//this.client.bot = this;
		this.mm = new MiddlewareManager();

		this._commands = [];
		this._commandNames = [];
	}

	use(...callbacks: (MiddlewareFunction | ErrorHandlingFunction)[]) {
		this.mm.use(...callbacks);
	}

	addCommand(...commands: Command[]) {
		commands.forEach(c => {
			if (c.name in this._commandNames) throw new Error('Duplicate command');
			if (c.aliases && Array.isArray(c.aliases)) {
				c.aliases.forEach((a) => {
					if (a in this._commandNames)
						throw new Error(`Duplicate command alias: ${a}`);
				});
				c.aliases.forEach((a) => {
					if (a in FORBIDDEN_NAMES)
						throw new Error(`Forbidden name: ${a}`)
				})
			}
			this._commandNames.push(c.name, ...c.aliases);
			this._commands.push(c);
			this.mm.use(c)
		})
	}

	/* register(commandName:string|string[], ...callbacks:MiddlewareFunction[]) {
		this.addCommand(new Command(commandName, ...callbacks));
	} */

	/* registerDirectory(dir: string, options: { skipErrors: boolean; } | undefined, ...middleware: MiddlewareFunction[]) {
		const newCommands = registerDir(dir, options, middleware);
		/* console.log(newCommands)
		for (const [, value] of Object.entries(newCommands)) {
			this.addCommand(value);
		}
	} */

	createInvite(): string {
		return `https://discord.com/api/oauth2/authorize?client_id=${this.user?.id}&permissions=8&scope=bot`;
	}

	isBotCommand(content: string): CommandMatch | null {
		if (!content.startsWith(this.prefix)) return null;
		const args = content.substr(this.prefix.length || 0).split(' ');
		const commandName = <string>args.shift();
		for (let i = 0; i < this._commands.length; i++) {
			const cm = this._commands[i].matches(commandName);
			if (cm) return cm;
		}
		return null;
	}

	messageHandler = (msg: Message) => {
		if (!msg.guild) return; //Only work in guild texts
		const { content } = msg;
		if (content.startsWith(this.prefix)) {
			const args = content.split(' ');
			args.shift();
			msg.content = msg.content.substring(this.prefix.length);
			this.mm.handle(msg, this, { args }, (err) => {
				if (err)
					console.error(err);
			});
			return;
		}
	}

	start(token: string): Promise<string> {
		return sequelize.sync().then(() => {
			this.on('message', this.messageHandler);
			return this.login(token);
		})
	}

	get commands() {
		return this._commands;
	}
}

type BotOptions = {
	prefix: string
} & ClientOptions;

export interface DiscordBotError extends Error {
	sendDiscord?: boolean,
}

export interface BotClient extends Client {
	bot: Bot
} 