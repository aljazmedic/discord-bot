import { Channel, GuildChannelResolvable, VoiceChannel } from 'discord.js';
import { MiddlewareFunction } from '../Bot/MiddlewareManager';
import SoundManager from '../SoundManager';

export function voice({ voiceChannelId, failNotJoined }: VoiceMiddlewareSettings = { voiceChannelId: null, failNotJoined: false }): MiddlewareFunction {
	//middleware that gets authors channel and appends it to params, some misc info also
	return function (msg, client, params, next) {
		const cid = voiceChannelId || msg.member?.voice.channelID;
		if (!cid) {
			if (failNotJoined) {
				return msg.reply("you have to be in a channel :loud_sound:");
			}
			next();
		} else {
			client.channels
				.fetch(cid)
				.then((voiceChannel: Channel) => {
					console.log('Author in voice: ', voiceChannel.id);
					params.voice = new SoundManager(client, <VoiceChannel>voiceChannel);
					next();
				})
				.catch((err: Error) => next(err));
		}
	};
}

type VoiceMiddlewareSettings = { voiceChannelId?: string | null, failNotJoined?: boolean }