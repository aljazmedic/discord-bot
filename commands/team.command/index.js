import teamEmbed from './teamEmbed';
import { parseArgs } from '../../middleware';
import { ArgumentParser } from 'argparse';
import toTeams from './toTeams';
import { voice } from '../../middleware';

const commandParser = new ArgumentParser();
commandParser.addArgument(['-n', '--numTeams'], {
	type: 'int',
	defaultValue: 2,
	dest:'n'
});
commandParser.addArgument('players', { nargs: '*', defaultValue: [] });

export default {
	name: 'team', //name of the command

	before: [parseArgs(commandParser), voice()], // middleware functions

	aliases: ['teams', 'ekipe', 'ekipa'],

	run: (msg, client, params) => {
		//final function
		console.log(params.parsed);
		let { n, players } = params.parsed;
		players = players.filter((e) => e != '' && e != undefined && e);
		const teams = {};
		if (players.length == 0) {
			// grab from voice
			const { authorIn, channel } = params.voiceChannelInfo;
			if (!authorIn) {
				return msg.reply(`you must be in a voice channel :loud_sound:`);
			}
			players = channel.members.map((gm) => gm.user);
			//console.log("Voice channel:", players)
		}
		//use arguments		
		const shuffled = toTeams(players);
		shuffled.forEach((e, idx) => {
			const teamIdx = `Team no. ${(idx % n) + 1}`;
			if (!(teamIdx in teams)) teams[teamIdx] = [];
			teams[teamIdx].push(e);
		});
		Object.entries(teams).forEach(([name, team]) => {
			msg.channel.send(teamEmbed({ name, team }));
		});
	},
};
