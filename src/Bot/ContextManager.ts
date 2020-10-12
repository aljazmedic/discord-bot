'use strict';

import fs from 'fs';
import path from 'path';
import Context from './Context';

const storage = path.join(__dirname, 'cache', 'contexts.json');

const createIfNoExist = (pth) => {
	return new Promise((resolve, reject) => {
		fs.exists(path.basename(pth), (e) => {
			if (!e) {
				fs.mkdir(path.basename(pth), { recursive: true }, (err) => {
					if (err) reject(err);
					resolve();
				});
			}
			resolve();
		});
	});
};

/* const readWithSubs = (basename) =>new Promise((resolve, reject)=>{
	const ret = {}
	fs.promises.readdir(basename).then(files=>{
		files.map(file=>{
			return fs.promises.lstat(path.join(basename, files))
		}).then(stats=>{
			stats.map(stat=>{
				if(stat.isDirectory()){
					return readWithSubs(path.join(basename, stat))
				}else if(stat.isFile()){
					
				}
			})
		})

	}).catch(reject)

} */

const deepInsert = (d, v, ...path) => {
	let ptr = d,
		i;
	for (i = 0; i < path.length - 1; i++) {
		const e = path[i];
		if (!(e in ptr)) ptr[e] = {};
		ptr = ptr[e];
	}
	ptr[path[i]] = v;
};

const deepGet = (d, ...path) => {
	let ptr = d,
		i;
	for (i = 0; i < path.length; i++) {
		const e = path[i];
		if (!(e in ptr)) return undefined;
		ptr = ptr[e];
	}
	return ptr;
};

export default class ContextManager {
	constructor() {
		this.contexts = {};
	}

	createContext = async (
		msg,
		name,
		obj,
		{ iA, iC, iG } = { iA: false, iC: false, iG: false },
	) => {
		return new Promise((resolve, reject) => {
			const guildId = iG ? '_' : msg.channel.guild.id,
				channelId = iC ? '_' : msg.channel.id,
				userId = iA ? '_' : msg.author.id;

			deepInsert(this.contexts, obj, guildId, channelId, userId, name);

			this._save()
				.then(() => {
					resolve(obj);
				})
				.catch(reject);
		});
	};

	async set(
		msg,
		name,
		key,
		value,
		{ iA, iC, iG } = { iA: false, iC: false, iG: false },
	) {
		return new Promise((resolve, reject) => {
			const guildId = iG ? '_' : msg.channel.guild.id,
				channelId = iC ? '_' : msg.channel.id,
				userId = iA ? '_' : msg.author.id;
			deepInsert(
				this.contexts,
				value,
				guildId,
				channelId,
				userId,
				name,
				...key.split('.').filter((e) => !!e),
			);
			this._save()
				.then(() => {
					resolve(this.getContext(msg, name, { iA, iC, iG }));
				})
				.catch(reject);
		});
	}

	getContext(
		msg,
		name,
		{ iA, iC, iG } = { iA: false, iC: false, iG: false },
	) {
		const guildId = iG ? '_' : msg.channel.guild.id,
			channelId = iC ? '_' : msg.channel.id,
			userId = iA ? '_' : msg.author.id;
		return deepGet(this.contexts, guildId, channelId, userId, name);
	}

	retrieveContexts = async () => {
		return new Promise((resolve, reject) => {
			if (this.contexts) {
				resolve(this.contexts);
			}

			fs.readFile(storage, (err, data) => {
				if (err) reject(err);
				try {
					this.contexts = JSON.parse(data);
				} catch (err) {
					console.error(err);
					this.contexts = {};
				}

				resolve(this.contexts);
			});
		});
	};

	forMessage = (msg) => {
		return new Context(msg, this);
	};

	_save = async () => {
		return new Promise((resolve, reject) => {
			fs.writeFile(storage, JSON.stringify(this.contexts), (err) => {
				if (err) reject(err);
				resolve();
			});
		});
	};
}

fs.exists(storage, (exists) => {
	if (!exists) {
		fs.writeFileSync(storage, '{}');
	}
});