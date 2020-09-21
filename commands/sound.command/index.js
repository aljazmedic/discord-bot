import { voice } from '../../middleware';
import ytdl from 'ytdl-core';
import SoundManager from '../../SoundManager';
import playFiles from './data';

const optionsForSrc = {
	meme: { volume: 0.3 },
};

function playAndExit(voiceChannel, src, { volume } = { volume: 0.8 }) {
	voiceChannel
		.join()
		.then((vconnection) => {
			const dispatcher = vconnection.play(src, { volume });
			dispatcher.on('speaking', (spk) => {
				if (!spk) {
					vconnection.disconnect();
				}
			});
		})
		.catch(console.error);
}
const sm = new SoundManager();

export default {
	name: ['p', 'play', 'dc'], //name of the command

	before: [voice()],
	run: (msg, client, params) => {
		const { authorIn, botIn, channel: voiceChannel } = params.voice.dict();

		if (params.trigger.call == 'dc') {
			if (botIn) params.voice.channel.leave();
			return;
		}

		if (params.args.length == 0) {
			return msg.reply(
				`pick a sound! (${Object.keys(playFiles).join(' | ')} )`,
			);
		}

		console.log(`${authorIn} ${voiceChannel}`);
		if (!authorIn) {
			return msg.reply('you must be in a channel :loud_sound:');
		}

		const key = params.args[0];
		if (key == 'meme') {
			//Implement custom soundbord urls
		}
		const uriOptions = playFiles[key];
		if (!uriOptions) {
			return msg.reply('invalid sound!');
		}
		const opt = optionsForSrc[uriOptions.src];
		params.voice
			.get(uriOptions)
			.then((uri) => params.voice.say(uri, opt))
			.catch(console.error);
	},
};
