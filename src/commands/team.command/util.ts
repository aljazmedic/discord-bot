import getName from './teamNames';
import {
	MessageEmbed,
	PermissionOverwrites,
	Guild,
	Client,
	Role,
	ColorResolvable,
	TextChannel,
	CategoryChannel,
	User,
	Message,
	GuildMember,ResolvedOverwriteOptions, UserResolvable
} from 'discord.js';
import { Color } from 'colors';

function shuffle(a:any[]) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j]; //[a[i], a[j]] = [a[j], a[i]]
		a[j] = x;
	}
	return a;
}

function firstLetters(s:string) {
	return s
		.split(/[ \t\n]+/gi)
		.map((s) => s.charAt(0).toUpperCase())
		.join('');
}

export function toTeams(players:UserResolvable[] | string[], n:number, allUsers=false):TeamSchema[] {
	const teams:{[index:string]:TeamSchema} = {};
	const shuffeled = shuffle(players); //TODO Biased implement

	shuffeled.forEach((e, idx) => {
		const indexName = `Team no. ${(idx % n) + 1}`;
		if (!(indexName in teams))
			teams[indexName] = { indexName, players: [] };
		teams[indexName].players.push(e);
	});
	Object.entries(teams).forEach(([indexName, team]) => {
		const name = getName();
		teams[indexName].name = name;

		const bg_colour = Math.floor(Math.random() * 16777215).toString(16);
		const color = (teams[indexName].color =
			'#' + ('000000' + bg_colour).slice(-6));

		teams[indexName].embed = createEmbed({
			indexName,
			name,
			team: team.players,
			color,
		});
		teams[indexName].prefix = firstLetters(name);
	});
	return Object.entries(teams).map(([, team]) => team);
}

export function createEmbed({ indexName, name, team, color }:TeamEmbedOptions):MessageEmbed {
	return new MessageEmbed()
		.setColor(color)
		.setTitle(name)
		.setDescription(indexName)
		.addFields(
			team.map((value:string|UserResolvable, idx:number) => {
				return { name: `Player #${idx + 1}`, value };
			}),
		);
}
/**
 *
 * @param {Guild} guild
 * @param {Client} client
 * @param {object} team
 */

export function createServerTeams(guild:Guild, client:Client, teams:TeamSchema[]):Promise<TeamChangesToServer> {
	const changes = {
		roles: [],
		channels: [],
		renames: {},
	};

	return new Promise((resolve, reject) => {
		Promise.all(
			teams.map((team) =>
				Promise.all([
					createTeamChannel(guild, client, team, changes),
					renamePlayers(guild, client, team, changes),
				]),
			),
		)
			.then(() => {
				resolve(changes);
			})
			.catch((e) => {
				e.changes = changes;
				reject(e)
			});
	});
}

export function createTeamChannel(
	guild:Guild,
	client:Client,
	team:TeamSchema,
	chgs:{roles:string[],channels:string[],[index:string]:{}} = { roles: [], channels: [], renames: {} },
) {
	const channelName = `${team.name}'s camp`;
	const roleName = `${team.prefix}`;
	const everyOne = guild.roles.everyone;

	const rolePerms = {
		//Explicitely allow the role to see, join and speak
		VIEW_CHANNEL: true,
		CONNECT: true,
		SPEAK: true,
	};
	const othPerms = {
		// Disallow Everyone to see, join, invite, or speak
		CREATE_INSTANT_INVITE: false,
		VIEW_CHANNEL: true,
		CONNECT: false,
		SPEAK: false,
	};


	return new Promise((resolve, reject) => {
		let role:Role,
		categoryChannelid:string;
		guild.roles
			.create({
				data: {
					name: roleName,
					color: team.color,
				},
			})
			.then((r:Role) => {
				role = r;
				chgs.roles.push(role.id);
				return Promise.all(
					team.players.map((p:string|UserResolvable):Promise<GuildMember>|undefined => {
						const _gm = guild.member(p);
						if(_gm)
							return _gm.roles.add(role);
					}).filter((p)=>!!p),
				);
			})
			.then(()=>{
				return guild.channels.create(<string>team.prefix, {
					type:'category',
					userLimit: team.players.length,
					nsfw:true
				})
			})
			.then((parent:CategoryChannel) => {
				categoryChannelid = parent.id;
				return Promise.all([
					guild.channels.create(channelName, {
						type: 'voice',
						parent,
						userLimit: team.players.length,
						permissionOverwrites: [
							{ id: everyOne, ...othPerms, type: 'role' },
							{ id: role, ...rolePerms, type: 'role' },
						],
						position: 0,
					}),
					guild.channels.create(channelName, {
						type: 'text',
						parent,
						userLimit: team.players.length,
						permissionOverwrites: [
							{ id: everyOne, ...othPerms, type: 'role' },
							{ id: role, ...rolePerms, type: 'role' },
						],
						position: 0,
					}),
				]);
			})
			.then((channels) => {
				chgs.channels.push(categoryChannelid, ...channels.map((channel) => channel.id));
				console.log(chgs);
				return resolve(chgs);
			})
			.catch(reject);
	});
}

export function renamePlayers(
	guild:Guild,
	client:Client,
	team:TeamSchema,
	chgs:TeamChangesToServer = { roles: [], channels: [], renames: {} },
) {
	return new Promise((resolve, reject) => {
		const guildMembers:Array<GuildMember|null> = team.players.map((p):GuildMember|null => guild.member(p));
		Promise.all(guildMembers)
			.then((members:(GuildMember|null)[]) => {
				return Promise.all(
					members
						.filter((member:GuildMember|null) => member && !(member.id == guild?.owner?.id))
						.map((member:GuildMember|null):Promise<RenameObject | boolean> => {
							const _member = <GuildMember>member;
							const displayName =
							_member.nickname || _member.user.username;
							const newName = `${team.prefix} ${displayName}`;
							console.log(
								'ACTION: rename ',
								displayName,
								'->',
								newName,
							);
							return new Promise((resolve, reject) => {
								_member
									.setNickname(newName)
									.then((m) =>
										resolve({
											memberId: m.id,
											oldNick: displayName,
											thisNick: newName,
										}),
									)
									.catch((e) => {
										console.error('Renaming: ', e);
										return resolve(false);
									});
							});
						}),
				);
			})
			.then((renamedMembers) => {
				console.log('RM', renamedMembers);
				renamedMembers
					.forEach((rename:RenameObject | boolean) => {
						if(typeof rename == 'object'){
							chgs.renames[rename.memberId] = rename;
						}
					});
				return resolve(chgs);
			})
			.catch(reject);
	});
}

export interface TeamEmbedOptions{
	indexName:string
	team:(string|UserResolvable)[]
	name:string
	color: ColorResolvable
}
export interface TeamSchema{
	indexName:string,
	players: (string|UserResolvable)[],
	name?:string,
	color?: ColorResolvable
	embed?:MessageEmbed,
	prefix?:string
}

export type RenameObject = {
	memberId: string,
	oldNick: string,
	thisNick: string,
};

export type TeamChangesToServer = {
	roles:string[]
	channels:string[]
	renames:{
		[index:string]:RenameObject
	}
}