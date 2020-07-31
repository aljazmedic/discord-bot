const MiddlewareManager = require("./MiddlewareManager");

module.exports = class Command {
  constructor(name, ...middleware) {
    this.mm = new MiddlewareManager();
    this.name = name.toLowerCase();
    this.runFunction = middleware.pop();
    this.mm.use(...middleware);
  }

  use = (...middlewares) => {
    return this.mm.use(...middlewares);
  }

  run = (msg, client, params) => { //Leave arrow so this is bind
    return this.mm.handle(msg, client, params, this.runFunction);
  }
};
