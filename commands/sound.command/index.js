import { voice } from '../../middleware';
import ytdl from 'ytdl-core';
import SoundManager from '../../SoundManager';

console.log(typeof voice);

const optionsForSrc = {
	meme: { volume: 0.3 },
};

const playFiles = {
	fart: { q: 'W_FRPoJIrlI', src: 'yt' },
	pog: { q: 'FZUcpVmEHuk', src: 'yt' },
	elbow: { q: 'pr_kkWVnHoo', src: 'yt' },
	mission: { q: '1Mission Failed.0013', src: 'meme' }, //https://www.memesoundboard.com
	tbc: { q: '1To%20Be%20Continued.0038', src: 'meme' },
	gay: { q: '1Im%20G*y.0072', src: 'meme' },
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
	name: ['p', 'play'], //name of the command

	before: [voice()],
	run: (msg, client, params) => {
		if (params.args.length == 0) {
			return msg.reply(
				`pick a sound! (${Object.keys(playFiles).join(' | ')} )`,
			);
		}

		const { authorIn, channel: voiceChannel } = params.voiceChannelInfo;
		if (!authorIn) {
			return msg.reply('you must be in a channel :loud_sound:');
		}

		const key = params.args[0];
		if (key == 'meme') {
			//Implement custom soundbord urls
		}
		const uriOptions = playFiles[key];
		const opt = optionsForSrc[uriOptions.src];
		sm.get(uriOptions)
			.then((uri) => playAndExit(voiceChannel, uri, opt))
			.catch(console.error);
	},
};
