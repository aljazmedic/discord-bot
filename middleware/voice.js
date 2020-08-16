export function voice({ join } = { join: false }) {
	return function (msg, client, params, next) {
		const cid = msg.member.voice.channelID;
		if (!cid) {
			params.voiceChannelInfo = {
				authorIn: false,
				channelID: null,
				voiceChannel: null,
			};
			next();
		}
		client.channels.fetch(cid).then((voiceChannel) => {
			console.log('Author in voice: ', voiceChannel.id);
			const clientIn = voiceChannel.members.find((guildMember) => {
				return guildMember.user.id == client.user.id;
			});

			params.voiceChannelInfo = {
				authorIn: true,
				channelID: cid,
				clientIn,
				channel: voiceChannel,
			};

			if (join && !clientIn) {
				voiceChannel.join();
			}
			next();
		});
	};
}
