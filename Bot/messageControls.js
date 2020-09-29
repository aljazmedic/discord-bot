export function msgCtrl(msg, client, emojiFnDict) {
	Promise.all(
		Object.keys(emojiFnDict).map((emoji) =>
			msg
				.react(emoji)
				.catch((err) =>
					Promise.resolve({ status: 'error', ...err }),
				),
		),
	).then((r) => {
		//console.log(r);
	});
	msg.awaitReactions(
		(reaction, user) =>
			user.id == msg.author.id &&
			Object.keys(emojiFnDict).includes(reaction.emoji.name),
		{ max: 1, time: 30000 },
	).then((collected) => {
		const emojiName = collected.first().emoji.name;
		emojiFnDict[emojiName](msg, client, {
			trigger: { reaction: emojiName, collected },
		});
	});
}
