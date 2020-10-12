import getName from './teamNames';
import {
	MessageEmbed,
	PermissionOverwrites,
	Guild,
	Client,
	Role,
} from 'discord.js';

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

function firstLetters(s) {
	return s
		.split(/[ \t\n]+/gi)
		.map((s) => s.charAt(0).toUpperCase())
		.join('');
}

export function toTeams(players, n) {
	let teams = {};
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
	teams = Object.entries(teams).map(([, team]) => team);
	return teams;
}

export function createEmbed({ indexName, name, team, color }) {
	return new MessageEmbed()
		.setColor(color)
		.setTitle(name)
		.setDescription(indexName)
		.addFields(
			team.map((value, idx) => {
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

export function createServerTeams(guild, client, teams) {
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
			.catch((e) => reject(e, changes));
	});
}

export function createTeamChannel(
	guild,
	client,
	team,
	chgs = { roles: [], channels: [], renames: {} },
) {
	const channelName = `${team.name}'s camp`;
	const roleName = `${team.prefix}`;
	const everyOne = guild.roles.everyone;

	const rolePerms = PermissionOverwrites.resolveOverwriteOptions({
		//Explicitely allow the role to see, join and speak
		VIEW_CHANNEL: true,
		CONNECT: true,
		SPEAK: true,
	});
	const othPerms = PermissionOverwrites.resolveOverwriteOptions({
		// Disallow Everyone to see, join, invite, or speak
		CREATE_INSTANT_INVITE: false,
		VIEW_CHANNEL: true,
		CONNECT: false,
		SPEAK: false,
	});


	return new Promise((resolve, reject) => {
		let role, categoryChannel;
		guild.roles
			.create({
				data: {
					name: roleName,
					color: team.color,
				},
			})
			.then((r) => {
				role = r;
				chgs.roles.push(role.id);
				return Promise.all(
					team.players.map((p) => {
						guild.member(p).roles.add(role);
					}),
				);
			})
			.then(()=>{
				return guild.channels.create(team.prefix, {
					type:'category',
					userLimit: team.players.length,
					nsfw:true
				})
			})
			.then((parent) => {
				categoryChannel = parent.id;
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
				chgs.channels.push(categoryChannel, ...channels.map((channel) => channel.id));
				console.log(chgs);
				return resolve(chgs);
			})
			.catch(reject);
	});
}

export function renamePlayers(
	guild,
	client,
	team,
	chgs = { roles: [], channels: [], renames: {} },
) {
	return new Promise((resolve, reject) => {
		Promise.all(team.players.map((p) => guild.member(p)))
			.then((members) => {
				return Promise.all(
					members
						.filter((member) => !(member.id == guild.owner.id))
						.map((member) => {
							const displayName =
								member.nickname || member.user.username;
							const newName = `${team.prefix} ${displayName}`;
							console.log(
								'ACTION: rename ',
								displayName,
								'->',
								newName,
							);
							return new Promise((resolve, reject) => {
								member
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
					.filter((member) => member != false)
					.forEach(({ memberId, oldNick, thisNick }) => {
						chgs.renames[memberId] = { oldNick, thisNick };
					});
				return resolve(chgs);
			})
			.catch(reject);
	});
}
