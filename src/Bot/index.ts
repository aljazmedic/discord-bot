import { Client, Message, ClientOptions, MessageReaction, DMChannel, TextChannel, NewsChannel, CollectorFilter, Emoji } from 'discord.js';
import MiddlewareManager, { ErrorHandlingFunction, MiddlewareFunction } from './MiddlewareManager';
import { addController } from './messageControls';
import Command, { CommandMessage, CommandTrigger } from './Command';


export { Command, MiddlewareManager, addController as msgCtrl };
import { sequelize } from './models';
import { getLogger } from '../logger';
import CommandResponse from './Command/response';
import { resolve } from 'app-root-path';
const logger = getLogger("Bot/index.ts");

const FORBIDDEN_NAMES = ['help', 'settings']

export default class Bot extends Client {
	prefix: string;
	private mm: MiddlewareManager;
	_commands: Command[]; //commands array
	_commandNames: string[]; //Checking the names dont overlap
	ownerId?: string;

	constructor(botOptions: BotOptions) {
		super(botOptions);
		this.prefix = botOptions.prefix;
		//this.client.bot = this;
		this.mm = new MiddlewareManager();


		this._commands = [];
		this._commandNames = [];
		this.ownerId = botOptions.ownerId;
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
		return false;
	}

	messageHandler = (msg: Message) => {
		if (msg.channel.type == "dm") {
			return; //Only work in guild texts
		}
		const { content } = msg;
		if (content.startsWith(this.prefix)) {
			//Alter message, so it does not have the prefix
			const trigger = this.isBotCommand(msg)
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
					channel: msg.channel as TextChannel | NewsChannel
				})
			this.mm.handle(cMsg, this, rsp, (err) => {
				if (err)
					logger.error(err);
			});
			return;
		}
	}


	/*
	 *	Function asks bot Owner for one of the answers on the DM as a Promise<boolean|number> 
	 */
	askOwner(prompt: string, nAnswrts: number): Promise<number>
	askOwner(prompt: string): Promise<boolean>
	askOwner(prompt: string, nAnswers?: number): Promise<boolean | number> {
		if (nAnswers && (nAnswers > 6 || nAnswers < 2)) return Promise.reject(new Error("Invalid number of answers"));
		let emojis: string[], getAnswer: { (reaction: MessageReaction): boolean | number };
		if (!nAnswers) {
			emojis = ['👎', '👍'];
			getAnswer = (r) => r.emoji.name == '👍'
		} else {
			emojis = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'].slice(0, nAnswers);
			getAnswer = (r) => emojis.indexOf(r.emoji.name)
		}

		return Promise.resolve().then(() => {
			if (!this.ownerId) throw new Error("Owner Id not set");
			return this.users.fetch(this.ownerId)
		}).then((u) =>
			u.createDM()
		).then((dms) => {
			return dms.send(prompt)
		}).then((msg) => {
			const collector = msg.createReactionCollector((reaction, user) => {
				return (user.id == this.ownerId) && (emojis.indexOf(reaction.emoji.name) != -1)
			}, { max: 1, })
			return Promise.all(emojis.map(emoji => msg.react(emoji)))
				.then(() => new Promise((resolve, reject) => {
					collector.on("collect", (reaction) => {
						const ans = getAnswer(reaction);
						resolve(ans);
					})
					collector.on("end", (collected) => {
						if (collected.size == 0) {
							reject(new Error("Collector timeout"));
						}
					})
				}))
		})
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
	nickname?: string;
	ownerId?: string;
} & ClientOptions;

export interface DiscordBotError extends Error {
	sendDiscord?: boolean,
}

export interface BotClient extends Client {
	bot: Bot
} 