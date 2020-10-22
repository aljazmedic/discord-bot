'use strict'
import {
	toTeams,
	createTeamChannel,
	renamePlayers,
	createServerTeams,
} from './util';
import { parseArgs } from '../../middleware';
import * as argparse from 'argparse';
import { voice } from '../../middleware';
import endgameCommand from '../endgame.command';
import { Message,Client, VoiceChannel, Guild, UserResolvable } from 'discord.js';

import Command, { CommandParameters } from '../../Bot/Command';

const { run: endgame } = endgameCommand;
const commandParser = new argparse.ArgumentParser();
commandParser.add_argument('-n','--numPlayers', {type: 'int',default: 2,dest: 'n',});
commandParser.add_argument('players', { nargs: '*', default: [] });

export default class Teams extends Command {
	constructor(){
		super();
		this.name= 'team', //name of the command
		this.mm.use(parseArgs(commandParser), voice()) // middleware functions
		this.aliases = ['teams', 'ekipe', 'ekipa']
	}

	run(msg:Message, client:Client, params:CommandParameters) {
		const lastGame = params.context?.get('gameTeams', {
			iA: true,iC:true
		});
		console.log(lastGame);
		if (lastGame)
			//still active
			endgame(msg, client, params);
		//final function
		console.log(params.parsed);
		let { n, players } = <{n:number,players:(string|UserResolvable)[]}>params.parsed;
		let allUsers = false; //Assume not all player objects are actual users
		players = players.filter(
			(e) => (e) && e != '' && e != undefined,
		);
		if (players.length == 0) {
			// grab from voice
			const { authorIn, channel } = <{authorIn:boolean, channel:VoiceChannel}>params.voice;
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
		const teams = toTeams(players, n, allUsers);
		console.log(teams);
		teams.forEach((team) => {
			msg.channel.send(team.embed);
		});
		if (allUsers) {
			createServerTeams(<Guild>msg.guild, client, teams)
				.then((changes) => {
					return params.context?.create('gameTeams', changes, {
						iA: true,iC:true
					});
				})
				.catch((e) => {
					params.context?.create('gameTeams', e.changes, {
						iA: true,
						iC:true
					});
					console.error(e);
				});
		}
	}
};
