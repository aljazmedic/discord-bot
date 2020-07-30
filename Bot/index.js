const discord = require("discord.js");
const MiddlewareManager = require("./middlewareManager");
const { parseMentions } = require("./middlewares");

module.exports = class Bot {
  constructor(prefix = "!") {
    this.prefix = prefix;
    this.client = new discord.Client();
    this.mm = new MiddlewareManager();
    this.commands = {};
    this.client.on("ready", () => {
      Object.assign(this, this.client);
    });
    this.use(parseMentions);
  }

  handleMessage = (msg, client, command, params) => {
    const f = this.commands[command];
    console.log(command);
    if (f) this.mm.handle(msg, client, params, f);
  };
  use = (callback) => {
    if (callback.length == 4) {
      //add to middleware
      this.mm.use(callback);
    } else {
      throw new Error("Invalid function");
    }
  };
  register = (commandName, callback) => {
    if (callback.length == 3) {
      if (commandName in this.commands) throw new Error("Duplicate command");
      this.commands[commandName] = callback;
    } else {
      throw new Error("Invalid function");
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
        const command = args.shift();
        this.handleMessage(msg, this.client, command, { args });
      }
    });
    return this.client.login(token);
  };
};
