import { Client, Message, MessageEmbed, VoiceChannel } from 'discord.js';
import Command, { CommandMessage, CommandResponse } from '../../Bot/Command';
import { SoundDB } from '../../Bot/models';
import { voice } from '../../middleware';
import SoundManager from '../../SoundManager';
import { getLogger } from '../../logger';
const logger = getLogger(__filename);

export default class Sound extends Command {
	constructor() {
		super('play');

		this.alias('p', 'dc', 'fuckoff') //name of the command

		this.before(voice())
	}
	run(msg: CommandMessage, client: Client, res: CommandResponse) {
		const { authorIn, botIn, channel: voiceChannel } = <SoundManager>msg.voice;

		console.log(msg.trigger.caller)
		switch (msg.trigger.caller) {
			case 'fuckoff':
				msg.reply(getOffensiveResponse())
					.then((msg) => {
						msg.delete({ timeout: 5000 });
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
							name: s.name,
							value: `Source ${s.src.toUpperCase()}`
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


const getOffensiveResponse = () => {
	const all = ["**K**nit **Y**ourself a nice **S**carf",
		"mods? help? dis nigga braindead",
		':middle_finger:',"( ͡° ͜ʖ ͡°)",
		"\`\`\`php\n$fuck_you = [\"but in\" => \"php\"]\;\n\`\`\`",
		"r u doing drugs again?", "New phone, Who dis?", "Allahu akhbar.", "aye ayn't",
		"what are you, fucking gay?","https://tenor.com/view/reverse-card-uno-uno-cards-gif-13032597",
		new MessageEmbed().setTitle('fuck you, but emebeded').setColor('3447003')
	]
	const idx = Math.floor(Math.random() * all.length);
	return all[idx];
}