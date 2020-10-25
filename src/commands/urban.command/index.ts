import { parseArgs, voice } from '../../middleware';
import { fromDataToEmbed, UrbanEmbedData } from './util'
import SoundManager from '../../SoundManager';
import axios from 'axios';
import { ArgumentParser } from 'argparse';
import Command, { CommandMessage, CommandResponse } from '../../Bot/Command'
import { Client, Message } from 'discord.js';
import { getLogger } from '../../logger';
const logger = getLogger(__filename);

const NODE_ENV = <string>process.env.NODE_ENV;
const urban_token = <string>require('../../../config/config.json')[NODE_ENV].urban_token || undefined;


import Sound from '../../Bot/models/Sound.model';

const commandParser = new ArgumentParser();
commandParser.add_argument('-s', {
	default: false,
	action: 'storeTrue',
	dest: 'say',
});

commandParser.add_argument('query', { nargs: '+', default: [], });

export default class Urban extends Command {
	constructor() {
		super();
		this.name = 'urban'
		this.alias('whatis', 'dict')
		this.before(parseArgs(commandParser), voice())
		this.description = 'Looks it up in urban dict'
	}

	run(msg: CommandMessage, client: Client, res: CommandResponse) {
		const { say, query } = <{ say: boolean, query: string[] }>msg.parsed;
		const term = query.join(" ")
		if (urban_token === undefined) {
			msg.reply("Developer messed up!");
			return
		}

		axios({
			method: 'GET',
			url: 'https://mashape-community-urban-dictionary.p.rapidapi.com/define',
			headers: {
				'content-type': 'application/octet-stream',
				'x-rapidapi-host': 'mashape-community-urban-dictionary.p.rapidapi.com',
				'x-rapidapi-key': urban_token,
				useQueryString: true,
			},
			params: {
				term,
			},
		})
			.then((response) => {
				const { list = [] }: { list: UrbanEmbedData[] } = response.data;
				if (list.length === 0) {
					return msg.reply("cannot find it!");
				}
				msg.reply(fromDataToEmbed(list[0]));
				console.log("Saying: " + say)
				let { sound_urls = [] } = list[0]
				sound_urls = sound_urls.filter((v: string) => v.startsWith('http://wav.urbandictionary.com'))
				if (!msg.voice?.authorIn) {
					msg.reply("you have to be in a channel! :loud_sound:");
				} else if (sound_urls.length && say) {
					const idx = Math.floor(Math.random() * sound_urls.length);
					const id = sound_urls[idx].substring("http://wav.urbandictionary.com/".length);
					Sound.create(
						{ id, src: 'urban', ext: 'wav' }
					).then(created => {
						SoundManager.get(created)
							.then((uri: string) => msg.voice?.say(uri))
							.catch(logger.error);
					})
				}
			})
			.catch((error) => {
				logger.error(error);
				return msg.reply("cannot find it!");
			});
	}
};
