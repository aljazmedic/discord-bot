import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

const storage = path.join(__dirname, `cache`);

const getWriteStreamFormp3 = (filename) =>
	new Promise((resolve, reject) => {
		if (!filename.endsWith('.mp3')) filename = filename + '.mp3';
		fs.promises
			.mkdir(path.dirname(filename), { recursive: true }) //naredi folder
			.then(() => {
				resolve(
					fs.createWriteStream(filename, {
						highWaterMark: 1 << 25,
					}),
				); //write stream za mp3
			})
			.catch(reject);
	});
const sources = {
	yt: (filename, q) =>
		//Definiran protokol za pridobivanje videov iz youtuba
		new Promise((resolve, reject) => {
			const query = `https://www.youtube.com/watch?v=${q}`;
			getWriteStreamFormp3(filename)
				.then((writeStream) => {
					ytdl(query, {
						quality: 'highestaudio',
                        highWaterMark: 1 << 25,
                        filter: 'audioonly' 
					})
						.pipe(writeStream) //preusmeri v file
						.on('error', reject);
					writeStream.on('finish', () => {
						//ko se zapiše resolva
						console.log(`finished writing ${filename}`);
						return resolve(filename);
					});
				})
				.catch(reject);
		}),
};

export default class SoundManager {
	consturctor() {}

	get(q, { src } = { src: 'yt' }) {
		return new Promise((resolve, reject) => {
			if (!Object.keys(sources).includes(src)) {
				return reject(new Error('invalid source: ' + src));
			}
			const filename = path.join(storage, src, q + '.mp3');
			fs.exists(filename, (exists) => {
				if (!exists) {
					sources[src](filename, q).then(resolve).catch(reject);
				} else {
					resolve(filename);
				}
			});
		});
	}
}
