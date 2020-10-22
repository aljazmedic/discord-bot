import { parseArgs, voice } from '../../middleware';
import { fromDataToEmbed, UrbanEmbedData } from './util'
import SoundManager from '../../SoundManager';
import axios from 'axios';
import { ArgumentParser } from 'argparse';
import Command, { CommandFunction, CommandParameters } from '../../Bot/Command'
import { CommandSchema } from '../../Bot/registerDirectory'
import { Client, Message } from 'discord.js';

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
		this.aliases = ['whatis', 'dict']
		this.mm.use(parseArgs(commandParser), voice())
		this.description = 'Looks it up in urban dict'
	}
	useParser(parser:ArgumentParser){
		console.log("URBAN");
	}

	run(msg: Message, client: Client, params: CommandParameters) {
		const { say, query } = <{ say: boolean, query: string[] }>params.parsed;
		const term = query.join(" ")
		axios({
			method: 'GET',
			url:
				'https://mashape-community-urban-dictionary.p.rapidapi.com/define',
			headers: {
				'content-type': 'application/octet-stream',
				'x-rapidapi-host':
					'mashape-community-urban-dictionary.p.rapidapi.com',
				'x-rapidapi-key':
					process.env.RAPID_API_URBAN_KEY,
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
				if (!params.voice?.authorIn) {
					msg.reply("you have to be in a channel! :loud_sound:");
				} else if (sound_urls.length && say) {
					const idx = Math.floor(Math.random() * sound_urls.length);
					const q = sound_urls[idx].substring("http://wav.urbandictionary.com/".length);
					console.log("query: ", q);
					SoundManager.get({ q, src: 'urban', ext: 'wav' })
						.then((uri: string) => params.voice?.say(uri))
						.catch(console.error);
				}
			})
			.catch((error) => {
				console.error(error);
				return msg.reply("cannot find it!");
			});
	}
};
