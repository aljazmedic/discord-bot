export function msgCtrl(msg, client, emojiFnDict) {
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

	return Promise.all(
		Object.keys(emojiFnDict).map((emoji) =>
			msg
				.react(emoji)
				.catch((err) => Promise.resolve({ status: 'error', ...err })),
		),
	);
}

export function selfDeleteCtrl(msg, client) {
	return msgCtrl(msg, client, {
		'🗑': (msg, client, params) => msg.delete(),
	});
}

export function selfDeleteMW(msg, client, params, next) {
	selfDeleteCtrl(msg, client);
	next();
}
