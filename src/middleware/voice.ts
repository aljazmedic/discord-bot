import SoundManager from '../SoundManager';

export function voice({ voice_channel_id } = { voice_channel_id: null }) {
	//middleware that gets authors channel and appends it to params, some misc info also
	return function (msg, client, params, next) {
		const cid = voice_channel_id || msg.member.voice.channelID;
		console.log('voice CID ' + cid);
		if (!cid) {
			params.voice = new SoundManager(client, undefined);
			next();
			return;
		}
		client.channels
			.fetch(cid)
			.then((voiceChannel) => {
				console.log('Author in voice: ', voiceChannel.id);
				params.voice = new SoundManager(client, voiceChannel);
				next();
			})
			.catch((err) => next(err));
	};
}
