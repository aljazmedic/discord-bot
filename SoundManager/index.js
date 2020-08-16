import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

const storage = path.join(__dirname, `cache`);
const sources = {
	yt: (filename, q) =>
		new Promise((resolve, reject) => {
			const query = `https://www.youtube.com/watch?v=${q}`;
			fs.promises.mkdir(path.dirname(filename), { recursive: true }).then(() => {
				ytdl(query, { quality: 'highestaudio', highWaterMark: 1 << 25 })
					.pipe(fs.createWriteStream(filename))
					.on('error', reject)
					.once('finish', () => {
						return resolve(filename);
					});
			});
		}),
};

export default class SoundManager {
	consturctor() {}

	get(q, { src } = { src: 'yt' }) {
		return new Promise((resolve, reject) => {
			if (!Object.keys(sources).includes(src)) {
				return reject(new Error('invalid source: ' + src));
			}
			const filename = path.join(storage, src, q);
			fs.readFile(filename, (err, data) => {
				if (err && err.errno != -4058) {
                    console.log(err)
					return reject(err);
				}
				if (!data || (err && err.errno == -4058)) {
					sources[src](filename, q)
						.then(resolve)
						.catch(console.error);
				} else {
					resolve(filename);
				}
			});
		});
	}
}
