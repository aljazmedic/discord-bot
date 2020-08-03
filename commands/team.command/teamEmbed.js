import { MessageEmbed } from 'discord.js';
import getName from './teamNames';

export default function createEmbed({ name, team }) {
	var bg_colour = Math.floor(Math.random() * 16777215).toString(16);
	bg_colour = '#' + ('000000' + bg_colour).slice(-6);

	return new MessageEmbed()
		.setColor(bg_colour)
		.setTitle(getName())
		.setDescription(name)
		.addFields(
			team.map((value, idx) => {
				return { name: `Player #${idx + 1}`, value };
			}),
		);
}
