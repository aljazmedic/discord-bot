const MiddlewareManager = require("./MiddlewareManager");
class Command {
  constructor(name, ...middleware) {
    this.mm = new MiddlewareManager();
    if (!Array.isArray(name)) {
      this.name = name.toLowerCase();
      this.aliases = [];
    } else {
      this.name = name.shift().toLowerCase();
      this.aliases = name;
    }
    this.runFunction = middleware.pop();
    this.mm.use(...middleware);
    this.description = "";
  }

  setDescription(description) {
    this.description = description;
  }

  matches = (token) => {
    if (this.name.startsWith(token))
      return {
        call: this.name,
        alias: false,
        fn: this,
      };
    if (this.aliases && this.aliases.length) {
      for (let i = 0; i < this.aliases.length; i++) {
        const alias = this.aliases[i];
        if (alias.startsWith(token)) {
          return {
            call: alias,
            alias: true,
            fn: this,
          };
        }
      }
    }
    return undefined;
  };

  use = (...middlewares) => {
    return this.mm.use(...middlewares);
  };

  run = (msg, client, params) => {
    //Leave arrow so this is bind
    return this.mm.handle(msg, client, params, this.runFunction);
  };

  toString = () => {
    return `Command(${this.name} [${this.aliases.join(", ")}], mw: ${
      this.mm.stack.length
    })`;
  };
}

module.exports = Command;
