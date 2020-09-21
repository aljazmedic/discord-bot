//import Bot from './Bot';

if (process.env.NODE_ENV == 'production') {
	require('dotenv').config();
}

import discord from 'discord.js';

const client = new discord.Client('?');
//BifD 695356910869676083
//Test server 494617599322095637
//bot.registerEmotes('695356910869676083', './add_emoji');
/* 
bot.onReady(()=>{
	const guild = bot.guilds.cache.get('695356910869676083');

	guild.members.fetch('291954774298066954').then((member)=>{
		member.setNickname('MyGuy Mihael');
	});
});
 */
client.on('message', async (message) => {
	console.log(message.content);

	return Promise.all(
		message.guild.roles.cache.map((s) => {
			console.log(s.name);
			return s.delete().catch((e) => {
				console.error(e)
				return Promise.resolve({ e });
			});
		}),
	).then((c) => c.forEach((e) => console.log(e)));
});

client.login(process.env.DISCORD_TOKEN); //_PRODUCTION)
