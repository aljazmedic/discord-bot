import { Client, Message, MessageEmbed, VoiceChannel } from 'discord.js';
import Command, { CommandMessage, CommandResponse } from '../../Bot/Command';
import { SoundDB } from '../../Bot/models';
import { voice } from '../../middleware';
import SoundManager from '../../SoundManager';
import { getLogger } from '../../logger';
const logger = getLogger(__filename);

export default class Sound extends Command {
	constructor() {
		super();
		this.name = 'play';
		this.alias('p', 'dc', 'fuckoff') //name of the command

		this.before(voice({ failNotJoined: true }))
	}
	run(msg:CommandMessage, client: Client, res: CommandResponse) {
		const { authorIn, botIn, channel: voiceChannel } = <SoundManager>msg.voice;


		switch (msg.trigger?.caller) {
			case 'fuckoff':
				msg.reply(':middle_finger:')
					.then((msg) => {
						msg.delete({ timeout: 2000 });
					});
			case 'dc':
				if (botIn) voiceChannel.leave();
				return;
		}

		if (msg.args.length == 0) {
			return SoundDB.findAll({ attributes: ['name'] }).then(sounds => {
				const helpEmbed = new MessageEmbed()
					.setTitle('Help')
					.addFields(sounds.map((s: SoundDB) => {
						return {
							name:s.name,
							value:`Source ${s.src.toUpperCase()}`
						}
					}))
				return msg.reply(helpEmbed);
			})

		}

		if (!authorIn) {
			return msg.reply('you must be in a channel :loud_sound:');
		}

		const name = <string>msg.args[0];

		SoundDB.findOne({ where: { name } }).then(soundSource => {
			if (!soundSource) {
				msg.reply('invalid sound!');
			} else {
				const { end, start } = soundSource;
				const options: any = {};
				if (start != null) options.start = start;
				if (end != null) options.end = end;
				SoundManager
					.get(soundSource)
					.then((uri) => msg.voice?.say(uri))
					.catch(err => logger.error(err));
			}
		})
	}
};
