import data from './data';
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
	GuildMember, ResolvedOverwriteOptions, UserResolvable
} from 'discord.js';
import { Color } from 'colors';

export function getTeamName() {
	const names = Object.entries(data).map(
		([, a]) => a[Math.floor(Math.random() * a.length)],
	);
	const name = names.join('');
	return [name, firstLetters(name)];
}

export function getTeamColor() {
	const bg_colour = Math.floor(Math.random() * 16777215).toString(16);
	return '#' + ('000000' + bg_colour).slice(-6);
}


function firstLetters(s: string) {
	return s
		.split(/[ \t\n]+/gi)
		.map((s) => s.charAt(0).toUpperCase())
		.join('');
}
