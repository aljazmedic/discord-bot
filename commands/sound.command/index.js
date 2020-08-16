import { voice } from '../../middleware';
import ytdl from 'ytdl-core';
import SoundManager from '../../SoundManager';

console.log(typeof voice);

const playFiles = {
	fart: 'W_FRPoJIrlI',
	pog: 'FZUcpVmEHuk',
};

function playAndExit(voiceChannel, src) {
	voiceChannel.join().then((vconnection) => {
		const dispatcher = vconnection.play(src, { volume: 0.8 });
		dispatcher.on('speaking', (spk) => {
			if (!spk) {
				vconnection.disconnect();
			}
		});
	});
}
const sm = new SoundManager();

export default {
	name: Object.keys(playFiles), //name of the command

	before: [voice()],
	run: (msg, client, params) => {
		//final function
		const { authorIn, channel: voiceChannel } = params.voiceChannelInfo;
		if (!authorIn) {
			msg.reply('you must be in a channel :loud_sound:');
			return;
		}

		sm.get(playFiles[params.trigger.call])
		.then((uri) =>
			playAndExit(voiceChannel, uri),
		);
	},
};
