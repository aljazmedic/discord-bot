import ytdl from 'ytdl-core';
import fs, { PathLike, WriteStream } from 'fs';
import path from 'path';
import { Client, VoiceChannel, VoiceConnection } from 'discord.js';
import request from 'request'
import { SayOptions, SoundSource } from '../commands/sound.command/data';
import { SoundDB } from "../Bot/models";
import { SoundAttributes } from '../Bot/models/Sound';
import ffmpeg from "fluent-ffmpeg";

const storage = path.join('..', '..', `cache`);

const createValidFilename = (src: string, q: string, ext: string = 'mp3') => {
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
const getWriteStreamForFile = (filename: string, parentResolve:{(reason?:any):void}, ppoptions:PostProcessOptions ,ext: string = 'mp3'): Promise<WriteStream> =>
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
					if (ppoptions) {
						SoundManager.postProcess(filename, ppoptions)
					}
					return parentResolve(filename);
				});
				return resolve(writeStream);
			})
			.catch(reject);
	});

const sources: { [index: string]: SourceFunction } = {
	yt: (filename, q, ppoptions = {}) =>
		//Definiran protokol za pridobivanje videov iz youtuba
		new Promise((resolve, reject) => {
			const query = `https://www.youtube.com/watch?v=${q}`;
			const _options: ytdl.downloadOptions = {
				quality: 'highestaudio',
				highWaterMark: 1 << 25,
				filter: 'audioonly'
			}

			getWriteStreamForFile(filename, resolve, ppoptions)
				.then((writeStream) => {
					ytdl(query, _options)
						.pipe(writeStream) //preusmeri v file
						.on('error', reject)
				})
				.catch(reject);
		}),
	meme: (filename, q, ppoptions) =>
		new Promise((resolve, reject) => {
			const url = `https://www.memesoundboard.com/sounds/${q}.mp3`;
			getWriteStreamForFile(filename, resolve, ppoptions).then((writeStream) => {
				request.get(url).pipe(writeStream).on('error', reject);
			});
		}),
	urban: (filename, q, ppoptions) =>
		new Promise((resolve, reject) => {
			const url = `http://wav.urbandictionary.com/${q}`;
			getWriteStreamForFile(filename, resolve, ppoptions, 'wav').then(
				(writeStream) => {
					request.get(url).pipe(writeStream).on('error', reject);
				},
			);
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

	static get({ id, src, ext, hash }: SoundAttributes, options: PostProcessOptions = {}): Promise<string> {
		return new Promise((resolve, reject) => {
			console.log(`Retrieving ${id} from ${src}`);
			if (!Object.keys(sources).includes(src)) {
				return reject(new Error('invalid source: ' + src));
			}
			const filename = createValidFilename(src, id, ext);
			fs.exists(filename, (exists) => {
				if (!exists) {
					console.log(`Downloading ${id} from ${src}`);
					sources[src](filename, id, options)
						.then(resolve)
						.catch(reject);
				} else {
					resolve(filename);
				}
			});
		});
	}

	static postProcess(filename: string, options: PostProcessOptions): ffmpeg.FfmpegCommand {
		let command = ffmpeg(filename)
			.audioCodec('libmp3lame')
			.setStartTime(options.start === undefined ? '0s' : options.start)
		if (options.duration !== undefined) {
			command = command.setDuration(options.duration);
		}
		return command.save(options.filename === undefined ? filename : options.filename);
	}

	say(uri: string, { volume }: SayOptions = { volume: 0.8 }) {
		console.log('Saying: ' + uri);
		this.client.clearTimeout(<NodeJS.Timer>this.dcTimeoutId);
		this.dcTimeoutId = undefined;
		return this.channel
			.join()
			.then((vconnection) => {
				const dispatcher = vconnection.play(uri, { volume });
				dispatcher.on('speaking', (spk) => {
					if (!spk) {
						this.dcTimeoutId = this.client.setTimeout(
							(channel, client) => {
								let { id: channelID } = channel; // Get the user's voice channel I
								if (channelID) {
									// Find an existing connection to that channel
									let connection = client.voice.connections.find(
										(conn: VoiceConnection) => conn.channel.id == channelID,
									);
									if (connection)
										// If you find one, use .disconnect()
										connection.disconnect();
								}
							},
							this.STAY_IN_VOICE_TIME, this.channel, this.client
						);
					}
				});
			})
			.catch(console.error);
	}
}


export interface SourceFunction {
	(filename: string, q: string, options: PostProcessOptions): Promise<string>
}

export type PostProcessOptions = {
	start?: string | number,
	duration?: string | number,
	hash?: string;
	filename?: string;
};