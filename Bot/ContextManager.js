'use strict';

import fs from 'fs';

const storage = __dirname + '/cache/contexts.json';
console.log(storage)
export default class ContextManager {
	constructor() {
		this.contexts = {};
	}

	createContext = async (msg, name, obj) => {
		return new Promise((resolve, reject) => {
			const context = {
				[msg.channel.guild.id]: {
					[msg.channel.id]: {
						[msg.author.id]: {
							[name]: obj,
						},
					},
				},
			};
			Object.assign(this.contexts, context);
			this._save().then(() => {
				resolve(context);
			});
		});
	}

	getContext(msg, name) {
		const guild = this.contexts[msg.channel.guild.id] || {};
		const channel = guild[msg.channel.id] || {};
		const author = channel[msg.author.id] || {};
		const context = author[name] || {};
		return context;
	}

	retrieveContexts = async () =>{
		return new Promise((resolve, reject) => {
			if (this.contexts) {
				resolve(this.contexts);
			}

			fs.readFile(storage, (err, data) => {
				if (err) reject(err);
				this.contexts = JSON.parse(data);
				resolve(this.contexts);
			});
		});
	}

	async _save() {
		return new Promise((resolve, reject) => {
			console.log("Saving")
			fs.writeFile(storage, JSON.stringify(this.contexts), ()=>{
				resolve();
			});
		});
	}
}

fs.exists(storage, (exists) => {
	if (!exists) {
		fs.writeFileSync(storage, "{}");
	}
});
