import { toTeams, createTeamChannel, renamePlayers } from './util';
import { parseArgs } from '../../middleware';
import { ArgumentParser } from 'argparse';
import { voice } from '../../middleware';
import endgameCommand from '../endgame.command.js';

const { run: endgame } = endgameCommand;
const commandParser = new ArgumentParser();
commandParser.addArgument(['-n', '--numTeams'], {
	type: 'int',
	defaultValue: 2,
	dest: 'n',
});
commandParser.addArgument('players', { nargs: '*', defaultValue: [] });

export default {
	name: 'team', //name of the command

	before: [parseArgs(commandParser), voice()], // middleware functions

	aliases: ['teams', 'ekipe', 'ekipa'],

	run: (msg, client, params) => {
		const lastGame = params.context.get('gameTeams', {
			iA: true,
		});
		console.log(lastGame);
		if (lastGame)
			//still active
			endgame(msg, client, params);
		//final function
		console.log(params.parsed);
		let { n, players } = params.parsed;
		let allUsers = false; //Assume not all player objects are actual users
		players = players.filter(
			(e) => (e || e == 0) && e != '' && e != undefined,
		);
		if (players.length == 0) {
			// grab from voice
			const { authorIn, channel } = params.voiceChannelInfo;
			if (!authorIn) {
				return msg.reply(`you must be in a voice channel :loud_sound:`);
			}
			players = channel.members.map((gm) => gm.user); //players from voice channel
			if (players.length == 1) {
				return msg.reply(`you need actual friends for a team`);
			}
			allUsers = true;
			//console.log("Voice channel:", players)
		}
		const teams = toTeams(players, n, { allUsers });
		console.log(teams);
		teams.forEach((team) => {
			msg.channel.send(team.embed);
		});
		if (allUsers) {
			const builtContext = {
				channels: [],
				roles: [],
				renames: {},
			}; //Saved for later clear
			Promise.all(
				teams.map((team) => createTeamChannel(msg.guild, client, team)),
			)
				.then((createdRolesAndChannels) => {
					console.log('CRAC', createdRolesAndChannels);
					createdRolesAndChannels.forEach(([roles, channels]) => {
						builtContext.roles.push(...roles);
						builtContext.channels.push(...channels);
					});
					return Promise.all(
						teams.map((team) =>
							renamePlayers(msg.guild, client, team),
						),
					);
				})
				.then((teamRenames = []) => {
					console.log('THEN renames', teamRenames);
					teamRenames.forEach((rename) => {
						Object.entries(rename).forEach(([k, v]) => {
							builtContext.renames[k] = v;
						});
					});
					return params.context.create('gameTeams', builtContext, {
						iA: true,
					});
				})
				.catch(console.error);
		}
	},
};
