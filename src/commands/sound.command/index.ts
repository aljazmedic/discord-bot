import { Client, Message, MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import Command, { CommandMessage, CommandResponse } from '../../Bot/Command';
import { SoundDB } from '../../Bot/models';
import { voice } from '../../middleware';
import SoundManager from '../../SoundManager';
import { getLogger } from '../../logger';
const logger = getLogger(__filename);

const all = ["**K**nit **Y**ourself a nice **S**carf",
	"mods? help? dis nigga braindead",
	':middle_finger:', "( ͡° ͜ʖ ͡°)",
	"\`\`\`php\n$fuck_you = [\"but in\" => \"php\"]\;\n\`\`\`",
	//"r u doing drugs again?", "New phone, Who dis?", "Allahu akhbar.",
	"aye ayn't",
	"what are you, fucking gay?", "https://tenor.com/view/reverse-card-uno-uno-cards-gif-13032597",
	new MessageEmbed().setTitle('fuck you, but emebeded').setColor('344703')
]

function getOffensiveResponse(nsfw = false) {
	if (nsfw) Promise.reject({ message: "NSFW Enabled" })
	const idx = Math.floor(Math.random() * all.length);
	return Promise.resolve(all[idx]);
}

export default class Sound extends Command {
	constructor() {
		super('play');

		this.alias('p', 'dc', 'fuckoff') //name of the command

		this.before(voice())
	}
	run(msg: CommandMessage, client: Client, res: CommandResponse) {
		const { authorIn, botIn, channel: voiceChannel } = <SoundManager>msg.voice;

		switch (msg.trigger.caller) {
			case 'fuckoff':
				getOffensiveResponse((<TextChannel>msg.channel).nsfw).then(snd => {
					return res.channelReply(snd)
				})
					.then((_msg) => {
						_msg.delete({ timeout: 5000 }).catch(e => logger.warn("Message already deleted"));
					}).then(() => msg.delete().catch(e => logger.warn("Message already deleted"))).catch(err => logger.error(err));
			case 'dc':
				if (botIn) voiceChannel.leave();
				return;
			default:
				break;
		}

		if (msg.args.length == 0) {
			return SoundDB.findAll({ attributes: ['name', 'src'] }).then(sounds => {
				const data: { [index: string]: string[] } =
					{};
				sounds.forEach(s => {
					if (!data[s.src]) {
						data[s.src] = [];
					}
					data[s.src].push(s.name)
				})
				const helpEmbed = new MessageEmbed()
					.setTitle('Help')
					.addFields(Object.entries(data)
						.map(([src, arr]) => {
							return {
								name: src.toUpperCase(),
								value: `Sounds \`${arr.join('\`, \`')}\``
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
					.then((uri) => {
						logger.debug("Resource uri: " + uri);
						return msg.voice?.say(uri);
					})
					.catch(err => logger.error(err));
			}
		})
	}
};

