import { parseNumbers } from '../../Bot/middlewares';
import teamEmbed from './teamEmbed';
import { parseArgs } from '../../middleware';
import { ArgumentParser } from 'argparse';

function shuffle(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j]; //[a[i], a[j]] = [a[j], a[i]]
		a[j] = x;
	}
	return a;
}

const commandParser = new ArgumentParser();
commandParser.addArgument(['-n', '--numTeams']);
commandParser.addArgument('--players', { nargs: '+' });

export default {
	name: 'team', //name of the command

	before: [parseArgs(commandParser)], // middleware functions

	aliases: ['teams', 'ekipe', 'ekipa'],

	run: (msg, client, params) => {
		//final function

		const n = params.args.shift();
		const shuffled = shuffle(params.args.filter(e=>e!="" && e != undefined && e).toArray());
		const ret = {};
		shuffled.forEach((e, idx) => {
			const teamNo = `Team no. ${(idx % n) + 1}`;
			if (!(teamNo in ret)) ret[teamNo] = [];
			ret[teamNo].push(e);
		});
		Object.entries(ret).forEach(([teamName, team]) => {
			msg.channel.send(teamEmbed({ name: teamName, team }));
		});
	},
};
