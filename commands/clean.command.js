export default {
	name: 'clean', //name of the command

	aliases: ['remove'],

	// eslint-disable-next-line no-unused-vars
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
				msg.delete({ timeout: 5000 });
			})
			.catch(console.error);
	},
};
