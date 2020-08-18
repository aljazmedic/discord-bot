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

export function createTeamChannel(guild, client, team) {
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
		VIEW_CHANNEL: false,
		CONNECT: false,
		SPEAK: false,
	});

	return new Promise((resolve, reject) => {
		let role;
		guild.roles
			.create({
				data: {
					name: roleName,
					color: team.color,
				},
			})
			.then((r) => {
				role = r;
				return Promise.all(
					team.players.map((p) => {
						guild.member(p).roles.add(role);
					}),
				);
			})
			.then(() => {
				return guild.channels.create(channelName, {
					type: 'voice',
					userLimit: team.players.length,
					permissionOverwrites: [
						{ id: everyOne, ...othPerms, type: 'role' },
						{ id: role, ...rolePerms, type: 'role' },
					],
					position: 0,
				});
			})
			.then((channel) => {
				return resolve([[role.id], [channel.id]]);
			})
			.catch(reject);
	});
}

export function renamePlayers(guild, client, team) {
	return new Promise((resolve, reject) => {
		const renames = {};
		Promise.all(team.players.map((p) => guild.member(p)))
			.then((members) => {
				return Promise.all(
					members
						.filter((member) => !(member.id == guild.owner.id))
						.map((member) => {
							const displayName =
								member.nickname || member.user.username;
							const newName = `${team.prefix} ${displayName}`;
							const memberId = `${member.id}`;
							renames[memberId] = {
								oldNick: displayName,
								thisNick: newName,
							};
							return member.setNickname(newName).catch((e) => e);
						}),
				);
			})
			.then((renamedMembers) => {
				renamedMembers
					.filter((member) => member instanceof Error)
					.forEach((e) => console.error(e));
				return resolve(renames);
			})
			.catch(reject);
	});
}
