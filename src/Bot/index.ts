import { Client, Message, ClientOptions, MessageReaction, DMChannel, TextChannel, NewsChannel } from 'discord.js';
import MiddlewareManager, { ErrorHandlingFunction, MiddlewareFunction } from './MiddlewareManager';
import { addController } from './messageControls';
import Command, { CommandMessage, CommandTrigger } from './Command';


export { Command, MiddlewareManager, addController as msgCtrl };
import { sequelize } from './models';
import { getLogger } from '../logger';
import CommandResponse from './Command/response';
const logger = getLogger(__filename);

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

		this.on('error', logger.error)
		this.on('warn', logger.warn)
		this.use(logger.logMiddleware!);
	}


	nicknameUpdater(name: string) {
		this.on('guildCreate', (g) => {
			const guildMember = g.members.cache.get(this.user!.id);
			if (guildMember)
				guildMember!.setNickname(name).catch(e => logger.warn(e));
		})
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

	//Warning! Non-pure function
	isBotCommand(msg: Message): CommandTrigger | false {
		if (!msg.content.startsWith(this.prefix)) return false;
		msg.content = msg.content.substring(this.prefix.length)
		for (let i = 0; i < this._commands.length; i++) {
			const cm = this._commands[i].matches(msg);
			if (cm) return cm;
		}
		logger.debug('Prefix ok, no match')
		return false;
	}

	messageHandler = (msg: Message) => {
		if (msg.channel.type != "text") return; //Only work in guild texts
		if(msg.channel instanceof DMChannel) return;
		const { content } = msg;
		if (content.startsWith(this.prefix)) {
			//Alter message, so it does not have the prefix
			const trigger = this.isBotCommand(msg)
			logger.debug("Command Trigger:", trigger)
			if (!trigger) {
				//It wont match any Layers
				return;
			}
			const rsp = new CommandResponse(msg);
			const args = msg.content.split(' ')
			args.shift()
			if (!msg.channel.isText()) return;
			const cMsg: CommandMessage = Object.assign(msg,
				{
					trigger,
					args,
					channel:msg.channel as TextChannel | NewsChannel
				})
			this.mm.handle(cMsg, this, rsp, (err) => {
				if (err)
					logger.error(err);
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
	prefix: string;
	nickname?: string
} & ClientOptions;

export interface DiscordBotError extends Error {
	sendDiscord?: boolean,
}

export interface BotClient extends Client {
	bot: Bot
} 