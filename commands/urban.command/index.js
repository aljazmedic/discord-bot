import { parseArgs, voice } from '../../middleware';
import {fromDataToEmbed} from './util'
import SoundManager from '../../SoundManager';
import axios from 'axios';
import { ArgumentParser } from 'argparse';


const commandParser = new ArgumentParser();
commandParser.addArgument(['-s'], {
	defaultValue: false,
	action: 'storeTrue',
	dest: 'say',
});

commandParser.addArgument('query', { nargs: '+', defaultValue: [],});
const sm = new SoundManager();

export default {
	name: 'urban',
	aliases: ['whatis', 'dict'],
	before: [parseArgs(commandParser), voice()],
	description: 'Looks it up in urban dict',
	run: function (msg, client, params) {
		console.log(params.parsed);
		let { say, query } = params.parsed;
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
                const {list=[]} = response.data;
                if(list.length === 0){
                    return msg.reply("cannot find it!");
                }
				msg.reply(fromDataToEmbed(list[0]));
				console.log("Saying: " + say)
				let {sound_urls = []} = list[0]
				sound_urls = sound_urls.filter((v)=>v.startsWith('http://wav.urbandictionary.com'))
				if(!params.voice.authorIn){
					msg.reply("you have to be in a channel! :loud_sound:");
				}else if(sound_urls.length && say){
					const idx = Math.floor(Math.random() * sound_urls.length);
					const q = sound_urls[idx].substring("http://wav.urbandictionary.com/".length);
					console.log("query: ",q);
					sm.get({ q, src:'urban',ext:'wav'})
						.then((uri) => params.voice.say(uri))
						.catch(console.error);
				}
			})
			.catch((error) => {
                console.error(error);
                return msg.reply("cannot find it!");
			});
	},
};
