import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import request from 'request';

const storage = path.join(__dirname, `cache`);

const createValidFilename = (src, q, ext = 'mp3') => {
	console.log('Creating filename for ' + q);
	let _q = q.replace(/[*\\/.:"'&$!()[\] ]/gi, '_a');
	if (!_q.endsWith(`.${ext}`)) _q = _q + `.${ext}`;
	return path.join(storage, src, _q);
};

/**
 *
 * @param {String} filename Filename for stream
 * @param {Resolve} parentResolve Final resolve to end parent promise
 */
const getWriteStreamForFile = (filename, parentResolve, ext = 'mp3') =>
	new Promise((resolve, reject) => {
		fs.promises
			.mkdir(path.dirname(filename), { recursive: true }) //naredi folder
			.then(() => {
				const writeStream = fs.createWriteStream(filename, {
					highWaterMark: 1 << 25,
				}); //write stream za mp3

				writeStream.on('finish', () => {
					//ko se zapiše resolva
					console.log(`finished writing ${filename}`);
					return parentResolve(filename);
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
			getWriteStreamForFile(filename, resolve)
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
			getWriteStreamForFile(filename, resolve).then((writeStream) => {
				request.get(url).pipe(writeStream).on('error', reject);
			});
		}),
	urban: (filename, q) =>
		new Promise((resolve, reject) => {
			const url = `http://wav.urbandictionary.com/${q}`;
			getWriteStreamForFile(filename, resolve, 'wav').then(
				(writeStream) => {
					request.get(url).pipe(writeStream).on('error', reject);
				},
			);
		}),
};

export default class SoundManager {
	constructor(client, voiceChannel) {
		this.channel = voiceChannel;
		this.authorIn = voiceChannel != undefined;
		this.botIn =
			voiceChannel &&
			voiceChannel.members.find((guildMember) => {
				return guildMember.user.id == client.user.id;
			});
	}

	get({ q, src, ext = 'mp3' } = { src: 'yt' }) {
		return new Promise((resolve, reject) => {
			console.log(`Retrieving ${q} from ${src}`);
			if (!Object.keys(sources).includes(src)) {
				return reject(new Error('invalid source: ' + src));
			}
			const filename = createValidFilename(src, q, ext);
			fs.exists(filename, (exists) => {
				if (!exists) {
					console.log(`Downloading ${q} from ${src}`);
					sources[src](filename, q).then(resolve).catch(reject);
				} else {
					resolve(filename);
				}
			});
		});
	}

	say(uri, { volume } = { volume: 0.8 }) {
		console.log('Saying: ' + uri);
		return this.channel
			.join()
			.then((vconnection) => {
				const dispatcher = vconnection.play(uri, { volume });
				dispatcher.on('speaking', (spk) => {
					if (!spk) {
						vconnection.disconnect();
					}
				});
			})
			.catch(console.error);
	}

	dict() {
		return {
			channel: this.channel,
			authorIn: this.authorIn,
			say: this.say,
			botIn:this.botIn
		};
	}
}
