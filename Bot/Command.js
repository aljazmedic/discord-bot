import MiddlewareManager from './MiddlewareManager';
export default class Command {
	constructor(name, ...middleware) {
		this.mm = new MiddlewareManager();
		if (!Array.isArray(name)) {
			this.name = name.toLowerCase();
			this.aliases = [];
		} else {
			this.name = name.shift().toLowerCase();
			this.aliases = name;
		}
		const f = middleware.pop();
		this.runFunction = (msg, client, params) => {
			if (params.isError) return; //TODO fix; middleware flags commmand error. Implement error handler middleware
			return f(msg, client, params);
		};
		this.mm.use(...middleware);
		this.description = '';
	}

	setDescription = (description) => {
		this.description = description;
	};

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
	toString() {
		return `Command(${this.name} [${this.aliases.join(', ')}], mw: ${
			this.mm.stack.length
		})`;
	}
}
