/* eslint-disable no-unused-vars */

import { parseNumbers } from '../../Bot/middlewares';

export default {
	name: 'random',
	aliases: ['dice', 'coin', 'coinflip', 'cointoss', 'dnd'],
	before: [parseNumbers],
	description: 'Returns a random value',
	run: function (msg, client, params) {
		let message = (n) => `picked a randum number ${n} out of a ${m}`;
		let m = params.args[0];
		if (!params.trigger.alias) {
            //The command was not called with an alias
			if (isNaN(m)) {
				m = 100;
			}
		} else {
			switch (params.trigger.call) {
                //aliases define its own max numbers
				case 'dice':
					m = 6;
					message = (n) => `rolled a ${n}`;
					break;
				case 'dnd':
					m = 20;
					message = (n) => `rolled a ${n == 20 ? '*natural* 20' : n} out of 20`;
					break;
				case 'coin':
				case 'coinflip':
					m = 2;
					message = (n) => `flipped ${n==1 ? 'heads' : 'tails'}`;
					break;
			}
		}
		const randN = Math.floor(Math.random() * m)+1;

		msg.channel.send(`${msg.author} ${message(randN)}`);
	},
};
