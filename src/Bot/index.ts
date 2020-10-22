import { Client, ClientUser, Message, MessageEmbed, User, ClientOptions } from 'discord.js';
import { createHelpCommand } from './help.command';
import { createSettingsCommand } from './settings.command';
import MiddlewareManager, { DoneCallback, ErrorCallback, ErrorHandlingFunction, MiddlewareFunction } from './MiddlewareManager';
import { msgCtrl } from './messageControls';
import Command, { CommandFunction, CommandMatch, CommandParameters } from './Command';
import ContextManager from './ContextManager';
import { parseIdsToObjects, withContext } from './middlewares';
import registerDir from './registerDirectory';

export { Command, ContextManager, MiddlewareManager, msgCtrl };
import { sequelize } from './models';
export default class Bot extends Client {
	prefix: string;
	mm: MiddlewareManager;
	cm: ContextManager;
	_commands: Command[];
	_commandNames: string[];

	constructor(botOptions: BotOptions) {
		super(botOptions);
		this.prefix = botOptions.prefix;
		//this.client.bot = this;
		this.mm = new MiddlewareManager();
		this.cm = new ContextManager();

		this._commands = [];
		this._commandNames = ['help', 'settings'];
		this.cm.retrieveContexts();
		this.use(parseIdsToObjects, withContext(this.cm));
	}

	handleMessage(msg: Message, params: CommandParameters, command: Command) {
		this.mm.handle(msg, this, params, command.toDone());
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
			}
			this._commands.push(c);
		})
	}

	/* register(commandName:string|string[], ...callbacks:MiddlewareFunction[]) {
		this.addCommand(new Command(commandName, ...callbacks));
	} */

	registerDirectory(dir: string, options: { skipErrors: boolean; } | undefined, ...middleware: MiddlewareFunction[]) {
		const newCommands = registerDir(dir, options, middleware);
		/* console.log(newCommands) */
		for (const [, value] of Object.entries(newCommands)) {
			this.addCommand(value);
		}
	}

	createInvite(): string {
		return `https://discord.com/api/oauth2/authorize?client_id=${this.user?.id}&permissions=1610087760&scope=bot`;
	}

	/**
	 *
	 * @param {int} t ms of the time
	 * @param {function} callback <client, params> Callback to be called every t-milliseconds
	 * @param {object} params Object to assign params to
	 */

	addRepeatingEvent(t: number, callback: Function, params: any[]) {
		//this callback has to have client and params
		this.on('ready', () => {
			setInterval(callback, t, this, params);
		});
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
			//Do parsing
			const args = content/* .substr(this.prefix.length || 0) */.split(' ');
			if (args.length == 0) return;
			const commandName = <string>args.shift();
			const commandInit = this.isBotCommand(commandName);
			console.log(commandInit);
			if (commandInit)
				return this.handleMessage(
					msg,
					{
						args,
						trigger: commandInit,
						entities: {}
					},
					commandInit.fn,
				);
		}
	}

	start(token: string): Promise<string> {
		return sequelize.sync().then(() => {
			this._commands.push(
				createHelpCommand(this._commands),
				//createSettingsCommand(),
			);
			this.on('message', this.messageHandler);
			return this.login(token);
		})
	}

	get commands() {
		return this._commands.map((c) => {
			const { name, description, aliases, mm: { stack }, } = c;
			return { name, description, aliases, 'mw#': stack.length };
		});
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