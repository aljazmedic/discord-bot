'use strict'
import { parseArgs } from '../../middleware';
import * as argparse from 'argparse';
import { voice } from '../../middleware';
import { Message, Client, VoiceChannel, Guild, UserResolvable, Team, GuildMemberResolvable, GuildMember, User } from 'discord.js';

import Command, { CommandParameters } from '../../Bot/Command';
import { TeamDB, TeamPlayerDB } from '../../Bot/models';
import { NextFunction } from '../../Bot/MiddlewareManager';

const commandParser = new argparse.ArgumentParser();
commandParser.add_argument('-n', '--numPlayers', { type: 'int', default: 2, dest: 'n', });
commandParser.add_argument('players', { nargs: '*', default: [] });

export default class Teams extends Command {
	constructor() {
		super();
		this.name = 'team'; //name of the command
		this.before(parseArgs(commandParser), voice()) // middleware functions
		this.alias('teams', 'ekipe', 'ekipa', 'endteams', 'endgame')
	}

	run(msg: Message, client: Client, params: CommandParameters) {
		/* console.log(lastGame);
		if (lastGame)
			//still active
			endgame(msg, client, params); */
		//final function
		console.log(params.trigger)
		switch (params.trigger!.call) {
			case 'endgame':
			case 'endteams': TeamDB.findAll({
				where: {
					gid: msg.guild!.id
				}
			}).then((teams) => {
				teams.forEach(t => t.disband(msg.guild!))
			}).catch(err => console.error(err))
				return;
		}


		console.log(params.parsed);
		let { n, players } = <{ n: number, players: (string | User)[] }>params.parsed;
		let allUsers = false; //Assume not all player objects are actual users
		players = players.filter(
			(e) => (e && e != '' && e != undefined),
		);
		if (players.length == 0) {
			// grab from voice
			const { authorIn, channel } = <{ authorIn: boolean, channel: VoiceChannel }>params.voice;
			if (!authorIn) {
				return msg.reply(`you must be in a voice channel :loud_sound:`);
			}
			const userPlayers: GuildMember[] = channel.members.array();//.map((gm) => gm.user); //players from voice channel
			if (userPlayers.length == 1) {
				return msg.reply(`you need actual friends for a team`);
			}
			allUsers = true;
			//console.log("Voice channel:", players)
			return TeamDB.createTeams(msg.guild!, n)
				.then((teams) => diviteIntoTeams(teams, userPlayers))
				.then((updatedTeams) => {
					updatedTeams.forEach(team => {
						msg.channel.send(team.createEmbed())
					})
				}).catch(err => console.error(err))
		}

	}
}

function shuffle<T>(a: T[]): T[] {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j]; //[a[i], a[j]] = [a[j], a[i]]
		a[j] = x;
	}
	return a;
}

const diviteIntoTeams = (teams: TeamDB[], teamMembers: (string | GuildMember)[]) => {
	const shuffeled = shuffle(teamMembers);
	const promises = shuffeled.map((e, idx) => {
		const team = teams[idx % teams.length];
		if (typeof e == "string") {
			return TeamPlayerDB.fromEntity(team, e)
		} else {
			return TeamPlayerDB.fromGuildMember(team, e);
		}
	})
	return Promise.all(promises).then(() =>
		Promise.all(teams.map(t => t.reload()))
	);
}