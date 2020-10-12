export default class Context {
	constructor(msg, cm) {
		this.msg = msg;
		this.cm = cm;
	}

	get(name, options={}) {
		return this.cm.getContext(this.msg, name, options);
    }
    
	async create(name, data, options={}) {
		return this.cm.createContext(this.msg, name, data, options);
	}

	async set(name, key, value, options={}) {
		return this.cm.set(this.msg, name, key, value, options);
	}
}
