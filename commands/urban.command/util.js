import { MessageEmbed } from 'discord.js';

export function fromDataToEmbed(d) {
    console.log(d)
	let { definition="", word, permalink, author, example="" } = d;
    definition = definition.replace(/[[\]]+/gi, '');
    example = example.replace(/[[\]]+/gi, '');
    console.log(definition)
	return new MessageEmbed()
		.setTitle(word.toUpperCase())
		.setURL(permalink)
		.setAuthor(author)
		.addField('Definition', definition)
        .addField('Example', example)
        .setFooter("UrbanDict via RapidApi", "https://rapidapi.com/static-assets/default/favicon.ico");
}
