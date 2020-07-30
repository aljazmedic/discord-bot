const discord = require("discord.js");
const MiddlewareManager = require("./MiddlewareManager");
const ErrorManager = require("./ErrorManager");
const Command = require("./Command");
const {
  parseIdsToObjects,
  parseNumbers,
  randomChance,
} = require("./middlewares");
const registerDir = require("./registerDirectory");

module.exports = class Bot {
  constructor(prefix = "!") {
    this.prefix = prefix;
    this.client = new discord.Client();
    this.mm = new MiddlewareManager();
    this.em = new ErrorManager();
    this.commands = {};
    this.client.on("ready", () => {
      Object.assign(this, this.client);
    });
    this.use(parseIdsToObjects);
  }

  handleMessage = (msg, client, params, commandName) => {
    const command = this.commands[commandName];
    if (command) this.mm.handle(msg, client, params, command.run);
  };

  use = (...callbacks) => {
    callbacks.forEach((callback, idx) => {
      this.mm.use(callback, 4);
    });
  };
  _addCommand = (c) => {
    if (c.name in this.commands) throw new Error("Duplicate command");
    this.commands[c.name] = c;
  };

  register = (commandName, ...callbacks) => {
    this._addCommand(new Command(commandName, ...callbacks));
  };

  registerDirectory = (dir) => {
    const newCommands = registerDir(dir);
    /* console.log(newCommands) */
    for (const [key, value] of Object.entries(newCommands)) {
      this._addCommand(value);
    }
  };

  onReady = (callback) => {
    return this.client.on("ready", callback);
  };

  start = (token) => {
    this.client.on("message", (msg) => {
      const { content } = msg;
      if (content.startsWith(this.prefix)) {
        //Do parsing
        const args = content.substr(this.prefix.length || 0).split(" ");
        const commandName = args.shift();
        this.handleMessage(msg, this.client, { args }, commandName);
      }
    });
    return this.client.login(token);
  };
};
