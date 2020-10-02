export function msgCtrl(msg, client, emojiFnDict) {
	Object.entries(emojiFnDict).forEach(([emoji, emojiFn]) =>
		msg
			.awaitReactions(
				(reaction, user) =>
					user.id == msg.author.id && reaction.emoji.name == emoji,
				{ max: 1, time: 30000 },
			)
			.then((collected) => {
				const {
					emoji: { name = false },
				} = collected.first();
				if (!name) return;
				emojiFn(msg, client, {
					trigger: { reaction: name, collected },
				});
			}),
	);

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
