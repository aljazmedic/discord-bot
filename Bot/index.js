import { Client } from 'discord.js';
import MiddlewareManager from './MiddlewareManager';
import ErrorManager from './ErrorManager';
import Command from './Command';
import { parseIdsToObjects, parseNumbers, randomChance } from './middlewares';
import registerDir from './registerDirectory';

export default class Bot {
    constructor(prefix = '!') {
        this.prefix = prefix;
        this.client = new Client();
        this.mm = new MiddlewareManager();
        this.em = new ErrorManager();
        this._commands = [];
        this._commandNames = [];
        this.client.on('ready', () => {
            Object.assign(this, this.client);
        });
        this.use(parseIdsToObjects);
    }

    handleMessage = (msg, client, params, command) => {
        if (command) this.mm.handle(msg, client, params, command.run);
    };

    use = (...callbacks) => {
        this.mm.use(...callbacks);
    };

    _addCommand = (c) => {
        if (c.name in this._commandNames) throw new Error('Duplicate command');
        if (c.aliases && Array.isArray(c.aliases)) {
            c.aliases.forEach((a) => {
                if (a in this._commandNames)
                    throw new Error(`Duplicate command alias: ${a}`);
            });
        }
        this._commands.push(c);
    };

    register = (commandName, ...callbacks) => {
        this._addCommand(new Command(commandName, ...callbacks));
    };

    registerDirectory = (dir, options) => {
        const newCommands = registerDir(dir, options);
        /* console.log(newCommands) */
        for (const [key, value] of Object.entries(newCommands)) {
            this._addCommand(value);
        }
    };

    onReady = (callback) => {
        return this.client.on('ready', callback);
    };

    createInvite = () => {
        return `https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=1945619521&scope=bot`;
    };

    start = (token) => {
        this.client.on('message', (msg) => {
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
                            { args, call: commandInit },
                            command
                        );
                }
            }
        });
        return this.client.login(token);
    };

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
