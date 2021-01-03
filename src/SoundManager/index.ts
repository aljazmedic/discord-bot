import ytdl from 'ytdl-core';
import fs, { PathLike, WriteStream } from 'fs';
import path from 'path';
import { Client, VoiceChannel, VoiceConnection } from 'discord.js';
import request from 'request'
import { SoundDB } from "../Bot/models";
import ffmpeg from "fluent-ffmpeg";

import { getLogger } from '../logger'
const logger = getLogger(__filename);

const storage = path.join(__dirname,'..','..','tmp', `cache`);
fs.mkdirSync(storage, { recursive: true })

const getFilename = (src: string, q: string, ext: string = 'mp3') => {
	logger.info('Creating filename for ' + q);
	let _q = q.replace(/[*\\/.:"'&$!()[\] ]/gi, '_a');
	if (!_q.endsWith(`.${ext}`)) _q = _q + `.${ext}`;
	return path.join(storage, src, _q);
};

/**
 *
 * @param {String} filename Filename for stream
 * @param {Resolve} parentResolve Final resolve to end parent promise
 */
const getWriteStreamForFile = (filename: string, parentResolve: { (reason?: any): void }, ext: string = 'mp3'): Promise<WriteStream> =>
	new Promise((resolve, reject) => {
		fs.promises
			.mkdir(path.dirname(filename), { recursive: true }) //naredi folder
			.then(() => {
				const writeStream = fs.createWriteStream(filename, {
					highWaterMark: 1 << 25,
				}); //write stream za mp3
				writeStream.on('finish', () => {
					//ko se zapiše resolva
					logger.info(`finished writing ${filename}`);
					return parentResolve(filename);
				});
				return resolve(writeStream);
			})
			.catch(reject);
	});

const sources: { [index: string]: SourceFunction } = {
	yt: (filename, q) =>
		//Definiran protokol za pridobivanje videov iz youtuba
		new Promise((resolve, reject) => {
			const query = `https://www.youtube.com/watch?v=${q}`;
			getWriteStreamForFile(filename, resolve)
				.then((writeStream) => {
					ytdl(query, {
						quality: 'highestaudio',
						//highWaterMark: 1 << 25,
						filter: 'audioonly'
					})
						.pipe(writeStream) //preusmeri v file
						.on('error', reject)
				})
				.catch(reject);
		}),
	meme: (filename, q) =>
		new Promise((resolve, reject) => {
			const url = `https://www.memesoundboard.com/sounds/${q}.mp3`;
			getWriteStreamForFile(filename, resolve).then((writeStream) => {
				request.get(url).pipe(writeStream).on('error', reject);
			}).catch(reject);
		}),
	urban: (filename, q) =>
		new Promise((resolve, reject) => {
			const url = `http://wav.urbandictionary.com/${q}`;
			getWriteStreamForFile(filename, resolve, 'wav').then(
				(writeStream) => {
					request.get(url).pipe(writeStream).on('error', reject);
				},
			).catch(reject);
		}),
};

export default class SoundManager {
	STAY_IN_VOICE_TIME = 3 * 1000;
	channel: VoiceChannel;
	client: Client;
	authorIn: boolean;
	botIn: any;
	dcTimeoutId: NodeJS.Timer | undefined;
	constructor(client: Client, voiceChannel: VoiceChannel) {
		this.channel = voiceChannel;
		this.client = client;
		this.authorIn = !!voiceChannel;
		this.botIn =
			voiceChannel &&
			voiceChannel.members.find((guildMember) => {
				return guildMember.user.id == client.user?.id;
			});
		this.dcTimeoutId = undefined;
	}

	static get({ id, src, ext, hash }: SoundDB,): Promise<string> {
		return new Promise((resolve, reject) => {
			logger.info(`Retrieving ${id} from ${src}`);
			if (!Object.keys(sources).includes(src)) {
				return reject(new Error('invalid source: ' + src));
			}
			const filename = getFilename(src, id, ext);//path.join(storage, );
			fs.promises.stat(filename).then((stat:fs.Stats) => {
				if (stat.size == 0) {
					logger.info(`Re-downloading ${id} from ${src}`);
					sources[src](filename, id)
						.then(resolve)
				} else {
					resolve(filename);
				}
			}).catch((e)=>{
				if(e.code && e.code == "ENOENT"){
					logger.info(`Downloading ${id} from ${src}`);
					sources[src](filename, id)
						.then(resolve)
				}else{
					reject(e)
				}	
			})
		});
	}

	static(filename: string, options: PostProcessOptions): ffmpeg.FfmpegCommand {
		let command = ffmpeg(filename)
			.audioCodec('libmp3lame')
			.setStartTime(options.start === undefined ? '0s' : options.start)
		if (options.duration !== undefined) {
			command = command.setDuration(options.duration);
		}
		return command.save(options.filename === undefined ? filename : options.filename);
	}

	say(uri: string, { volume }: SayOptions = { volume: 0.8 }) {
		logger.info('Saying: ' + uri);
		//this.client.clearTimeout(<NodeJS.Timer>this.dcTimeoutId);
		//this.dcTimeoutId = undefined;
		return this.channel
			.join()
			.then((vconnection) => {
				const dispatcher = vconnection.play(uri).on('speaking', (spk) => {
					if (!spk) {
						let { id: channelID } = this.channel; // Get the user's voice channel I
						logger.debug(channelID)
						if (channelID && this.client && this.client.voice) {
							// Find an existing connection to that channel
							let connection = this.client.voice.connections.find(
								(conn: VoiceConnection) => conn.channel.id == channelID,
							);
							if (connection)
								// If you find one, use .disconnect()
								connection.disconnect();
						}
					}
				});
				//dispatcher.on('')
			})
			.catch((e) => { logger.error(e) });
	}
}


export interface SourceFunction {
	(filename: string, q: string): Promise<string>
}

export type PostProcessOptions = {
	start?: string | number,
	duration?: string | number,
	hash?: string;
	filename?: string;
};


export type SayOptions = {
	volume?: number

}