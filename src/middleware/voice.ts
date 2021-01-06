import { Channel, GuildChannelResolvable, VoiceChannel } from 'discord.js';
import { MiddlewareFunction } from '../Bot/MiddlewareManager';
import { getLogger } from '../logger';
import SoundManager from '../SoundManager';

const logger = getLogger(__filename)
export function voice({ voiceChannelId, failNotJoined }: VoiceMiddlewareSettings = { voiceChannelId: null, failNotJoined: false }): MiddlewareFunction {
	//middleware that gets authors channel and appends it to params, some misc info also
	return function (msg, client, res, next) {
		const cid = voiceChannelId || msg.member?.voice.channelID;
		logger.debug(`voice MW: ${cid}`)
		if (!cid) {
			if (failNotJoined) {
				return res.msgReply("you have to be in a channel :loud_sound:");
			}
			return next();
		} else {
			client.channels
				.fetch(cid)
				.then((voiceChannel: Channel) => {
					logger.info('Author in voice: ', voiceChannel);
					msg.voice = new SoundManager(client, <VoiceChannel>voiceChannel);
					next();
				})
				.catch((err: Error) => {
					logger.error(err);
					if (failNotJoined) next(err)
					else next()
				});
		}
	};
}

type VoiceMiddlewareSettings = { voiceChannelId?: string | null, failNotJoined?: boolean }