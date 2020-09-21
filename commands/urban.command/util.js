import { MessageEmbed } from 'discord.js';

export function fromDataToEmbed(d) {
	console.log(d);
	let { definition = '', word, permalink, author, example = '' } = d;
	definition = definition.replace(/[[\]]+/gi, '').substring(0,1024);
	example = example.replace(/[[\]]+/gi, '').substring(0,1024);
	console.log(definition, example);
	const me = new MessageEmbed()
		.setTitle(word.toUpperCase())
		.setURL(permalink)
		.setAuthor(author)
		.setFooter(
			'UrbanDict via RapidApi',
			'https://rapidapi.com/static-assets/default/favicon.ico',
		);
	if (definition) me.addField('Definition', definition);
	if (example) me.addField('Example', example);
	return me;
}
