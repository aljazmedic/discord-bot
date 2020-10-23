import { Client, Message, VoiceChannel } from 'discord.js';
import { Literal } from 'sequelize/types/lib/utils';
import Command, { CommandParameters } from '../../Bot/Command';
import { SoundDB } from '../../Bot/models';
import { voice } from '../../middleware';
import SoundManager from '../../SoundManager';

export default class Sound extends Command {
	constructor() {
		super();
		this.name = 'play';
		this.alias('p', 'dc') //name of the command

		this.before(voice({ failNotJoined: true }))
	}
	run(msg: Message, client: Client, params: CommandParameters) {
		const { authorIn, botIn, channel: voiceChannel } = <SoundManager>params.voice;

		if (params.trigger?.call == 'dc') {
			if (botIn) voiceChannel.leave();
			return;
		}

		if (params.args.length == 0) {
			return SoundDB.findAll({ attributes: ['name'] }).then(sounds => {
				msg.reply(
					`pick a sound! (${sounds.map(s => s.name).join(' | ')} )`,
				);
			}).catch(err=>console.error(err))

		}

		if (!authorIn) {
			return msg.reply('you must be in a channel :loud_sound:');
		}

		const name = <string>params.args[0];

		SoundDB.findOne({ where: { name } }).then(soundSource => {
			if (!soundSource) {
				msg.reply('invalid sound!');
			} else {
				const { end, start } = soundSource;
				const options: any = {};
				if (start != null) options.start = start;
				if (end != null) options.end = end;
				SoundManager
					.get(soundSource, options)
					.then((uri) => params.voice?.say(uri))
					.catch(err=>console.error(err));
			}
		})
	}
};
