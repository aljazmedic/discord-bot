/* eslint-disable no-unused-vars */

import { Client, Message } from 'discord.js';
import Command, { CommandParameters } from '../../Bot/Command';
import { parseNumbers } from '../../Bot/middlewares';

export default class Random extends Command {
	constructor() {
		super();
		this.name = 'random'
		this.aliases = ['dice', 'coin', 'coinflip', 'cointoss', 'dnd']
		this.mm.use(parseNumbers)
		this.description = 'Returns a random value'
	}
	run(msg: Message, client: Client, params: CommandParameters) {
		let message: { (n: number): string } = (n) => `picked a randum number ${n} out of a ${m}`;
		let m: number;
		if (!params.trigger.alias) {
			//The command was not called with an alias
			if (Number.isNaN(Number(params.args[0]))) {
				m = 100;
			} else {
				m = Number(params.args[0]);
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
					message = (n) => `flipped ${n == 1 ? 'heads' : 'tails'}`;
					break;
				default:
					m = 100
			}
		}
		const randN = Math.floor(Math.random() * m) + 1;

		msg.channel.send(`${msg.author} ${message(randN)}`);
	}
};
