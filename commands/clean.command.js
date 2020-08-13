import {Message} from 'discord.js';

export default {
	name: "clean", //name of the command

	aliases: ["remove"],

	run: (msg, client, params) => {
        const { channel } = msg;
	channel.messages
		.fetch({ limit: 50 })
		.then((messages) => {
			return channel.bulkDelete(
				messages.filter(
					(m) =>
						m.author.id == client.user.id ||
						m.content.startsWith(client.bot.prefix),
				),
			);
		})
		.then((msgs) => {
			if (msgs) {
				msgs.forEach((e) => console.log(`${e}`));
			}
			console.log('deleted ' + (msgs.length || 0));
			return channel.send(':recycle: Messages deleted!');
		})
		.then((msg) => {
            setTimeout(async (m)=>{
                await m.delete();
            }, 3*1000, msg)
        })
		.catch(console.error);
	},
};
