/* eslint-disable no-unused-vars */

import { Client, Message } from 'discord.js';
import Command, { CommandMessage, CommandResponse } from '../../Bot/Command';
import { parseNumbers } from '../../middleware';

export default class Random extends Command {
	constructor() {
		super();
		this.name = 'random'
		this.alias('dice', 'coin', 'coinflip', 'cointoss', 'dnd')
		this.before(parseNumbers)
		this.description = 'Returns a random value'
	}
	run(msg: CommandMessage, client: Client, res: CommandResponse) {
		let m: number;
		let message: { (n: number): string } = (n) => `picked a randum number ${n} out of a ${m}`;
		if (!msg.trigger.alias) {
			//The command was not called with an alias
			if (Number.isNaN(Number(msg.args[0]))) {
				m = 100;
			} else {
				m = Number(msg.args[0]);
			}
		} else {
			switch (msg.trigger!.caller) {
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
				case 'cointoss':
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
