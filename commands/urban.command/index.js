import { parseNumbers } from '../../Bot/middlewares';
import {fromDataToEmbed} from './util'
import axios from 'axios';

export default {
	name: 'urban',
	aliases: ['whatis', 'dict'],
	before: [parseNumbers],
	description: 'Looks it up in urban dict',
	run: function (msg, client, params) {
        const term = params.args.join(" ")
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
			})
			.catch((error) => {
                console.error(error);
                return msg.reply("cannot find it!");
			});
	},
};
