import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import request from 'request';

const storage = path.join(__dirname, `cache`);

const createValidFilename = (src, q)=>{
    const _q = q.replace(/[*\\/."'&$!() ]/gi, '_a')
    return path.join(storage, src, _q + '.mp3');
}


/**
 * 
 * @param {String} filename Filename for stream
 * @param {Resolve} finishResolve Final resolve to end parent promise
 */
const getWriteStreamFormp3 = (filename, finishResolve) =>
	new Promise((resolve, reject) => {
		if (!filename.endsWith('.mp3')) filename = filename + '.mp3';
		fs.promises
			.mkdir(path.dirname(filename), { recursive: true }) //naredi folder
			.then(() => {
				const writeStream = fs.createWriteStream(filename, {
					highWaterMark: 1 << 25,
				}); //write stream za mp3

				writeStream.on('finish', () => {
					//ko se zapiše resolva
					console.log(`finished writing ${filename}`);
					return finishResolve(filename);
				});

				return resolve(writeStream);
			})
			.catch(reject);
	});

const sources = {
	yt: (filename, q) =>
		//Definiran protokol za pridobivanje videov iz youtuba
		new Promise((resolve, reject) => {
			const query = `https://www.youtube.com/watch?v=${q}`;
			getWriteStreamFormp3(filename, resolve)
				.then((writeStream) => {
					ytdl(query, {
						quality: 'highestaudio',
						highWaterMark: 1 << 25,
						filter: 'audioonly',
					})
						.pipe(writeStream) //preusmeri v file
						.on('error', reject);
				})
				.catch(reject);
		}),
	meme: (filename, q) =>
		new Promise((resolve, reject) => {
			const url = `https://www.memesoundboard.com/sounds/${q}.mp3`;
			getWriteStreamFormp3(filename, resolve).then((writeStream) => {
				request.get(url).pipe(writeStream).on('error', reject);
			});
		}),
};

export default class SoundManager {
	consturctor() {}

	get({ q,src } = { src: 'yt' }) {
		return new Promise((resolve, reject) => {
            console.log(`Getting ${q} from ${src}`)
			if (!Object.keys(sources).includes(src)) {
				return reject(new Error('invalid source: ' + src));
			}
			const filename = createValidFilename(src, q)
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
