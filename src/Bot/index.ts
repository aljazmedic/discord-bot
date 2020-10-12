import { Client, ClientUser, MessageEmbed, User } from 'discord.js';
import { createHelpCommand } from './help.command';
import { createSettingsCommand } from './settings.command';
import MiddlewareManager from './MiddlewareManager';
import ErrorManager from './ErrorManager';
import { msgCtrl } from './messageControls';
import Command from './Command';
import ContextManager from './ContextManager';
import { parseIdsToObjects, withContext } from './middlewares';
import registerDir from './registerDirectory';

export { Command, ContextManager, MiddlewareManager, msgCtrl };
import db from './models';
export default class Bot {
	prefix: string;
	client: Client;
	mm: MiddlewareManager;
	em: ErrorManager;
	cm: ContextManager;
	_commands: never[];
	_commandNames: string[];
	settings: { memeChannel: null; };
	user:ClientUser | null;
	constructor({prefix}:BotOptions) {
		this.prefix = prefix;
		this.client = new Client();
		this.client.bot = this;
		this.mm = new MiddlewareManager();
		this.em = new ErrorManager();
		this.cm = new ContextManager();

		this._commands = [];
		this._commandNames = ['help', 'settings'];
		this.user = this.client.user;
		this.client.on('ready', () => {
			Object.assign(this, this.client);
		});
		this.cm.retrieveContexts();
		this.use(parseIdsToObjects, withContext(this.cm));
		this.settings = {
			memeChannel: null,
		};
		this.client.on('message',(msg)=>{
			const {Guild} = db;
			console.log(msg)
			Guild.fromDiscordGuild(msg.channel.guild).then(g=>console.log(g)).catch(console.error);
		})
	}

	handleMessage(msg, client, params, callback) {
		this.mm.handle(msg, client, params, callback);
	}

	use(...callbacks) {
		this.mm.use(...callbacks);
	}

	_addCommand(c) {
		if (c.name in this._commandNames) throw new Error('Duplicate command');
		if (c.aliases && Array.isArray(c.aliases)) {
			c.aliases.forEach((a) => {
				if (a in this._commandNames)
					throw new Error(`Duplicate command alias: ${a}`);
			});
		}
		this._commands.push(c);
	}

	register(commandName, ...callbacks) {
		this._addCommand(new Command(commandName, ...callbacks));
	}

	registerDirectory(dir, options, ...middleware) {
		const newCommands = registerDir(dir, options, middleware);
		/* console.log(newCommands) */
		for (const [, value] of Object.entries(newCommands)) {
			this._addCommand(value);
		}
	}

	onReady(callback) {
		return this.client.on('ready', callback);
	}

	createInvite() {
		return `https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=1610087760&scope=bot`;
	}

	/**
	 *
	 * @param {int} t ms of the time
	 * @param {function} callback <client, params> Callback to be called every t-milliseconds
	 * @param {object} params Object to assign params to
	 */

	addRepeatingEvent(t, callback, params) {
		//this callback has to have client and params
		this.onReady(() => {
			setInterval(callback, t, this.client, params);
		});
	}

	isBotCommand(content) {
		if (!content.startsWith(this.prefix)) return false;
		const args = content.substr(this.prefix.length || 0).split(' ');
		const commandName = args.shift();
		for (let i = 0; i < this._commands.length; i++) {
			if (this._commands[i].matches(commandName)) return true;
		}
		return false;
	}

	start(token) {
		return db.sequelize.sync().then(() => {
			this._commands.push(
				createHelpCommand(this._commands),
				createSettingsCommand(),
			);
			this.client.on('message', (msg) => {
				if (!msg.guild) return; //Only work in guild texts
				const { content } = msg;
				if (content.startsWith(this.prefix)) {
					//Do parsing
					const args = content.substr(this.prefix.length || 0).split(' ');
					const commandName = args.shift();
					for (let i = 0; i < this._commands.length; i++) {
						const command = this._commands[i];
						const commandInit = command.matches(commandName);
						if (commandInit)
							return this.handleMessage(
								msg,
								this.client,
								{
									args,
									trigger: commandInit,
									settings: this.settings,
								},
								command.run,
							);
					}
				}
			});
			return this.client.login(token);
		}).catch(err=>console.error(err))
	}

	get commands() {
		return this._commands.map((c) => {
			const {
				name,
				description,
				aliases,
				mm: { stack },
			} = c;
			return { name, description, aliases, 'mw#': stack.length };
		});
	}
}

interface BotOptions {
	prefix:string
}

export interface DiscordBotError extends Error {
	sendDiscord?:{message?:string}
}