import { Client } from 'discord.js';
import MiddlewareManager from './MiddlewareManager';
import ErrorManager from './ErrorManager';
import Command from './Command';
import ContextManager from './ContextManager';
import { parseIdsToObjects, withContext } from './middlewares';
import registerDir from './registerDirectory';

export { Command, ContextManager, MiddlewareManager };

export default class Bot {
	constructor(prefix = '!') {
		this.prefix = prefix;
		this.client = new Client();
		this.client.bot = this;
		this.mm = new MiddlewareManager();
		this.em = new ErrorManager();
		this.cm = new ContextManager();

		this._commands = [];
		this._commandNames = [];
		this.client.on('ready', () => {
			Object.assign(this, this.client);
		});
		this.cm.retrieveContexts();
		this.use(parseIdsToObjects, withContext(this.cm));
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

	start(token) {
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
								trigger: commandInit
							},
							command.run,
						);
				}
			}
		});
		return this.client.login(token);
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
