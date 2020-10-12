import { voice } from '../../middleware';
import playFiles from './data';

const optionsForSrc = {
	meme: { volume: 0.3 },
};

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
