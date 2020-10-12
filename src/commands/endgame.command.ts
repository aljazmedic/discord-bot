export default {
	name: 'endgame', //name of the command

	aliases: ['endteams'],

	run: (msg, client, params) => {
		//final function
		const contextData =
			params.context.get('gameTeams', {
				iA: true,
				iC: true,
			}) || {};
		const { roles = [], channels = [], renames = {} } = contextData;

		Promise.all(
			roles.map((role) => {
				const rol = msg.guild.roles.cache.get(role);
				if (rol) rol.delete();
				else Promise.resolve({ message: `No such role ${role}` });
			}),
		)
			.then(() => {
				params.context.set('gameTeams', 'roles', [], {
					iA: true,
					iC: true,
				});
			})
			.catch(console.error);
		Promise.all(
			channels.map((channel) => {
				const chnl = msg.guild.channels.cache.get(channel);
				if (chnl) chnl.delete();
				else Promise.resolve({ message: `No such channel ${channel}` });
			}),
		)
			.then(() => {
				params.context.set('gameTeams', 'channels', [], {
					iA: true,
					iC: true,
				});
			})
			.catch(console.error);
		Promise.all(
			Object.entries(renames).map(
				([memberId, { oldNick = null, thisNick = null }]) => {
					const member = msg.guild.members.cache.get(memberId);
					if (!member)
						return Promise.resolve({
							message: `No such member ${memberId}`,
						});
					const displayName = member.nickname || member.user.username;
					if (displayName == thisNick)
						//If already renamed don't change
						return member.setNickname(oldNick);
					else
						return Promise.resolve({
							message: `Nickname already changed!`,
						});
				},
			),
		)
			.then(() => {
				params.context.set(
					'gameTeams',
					'renames',
					{},
					{
						iA: true,
						iC: true,
					},
				);
			})
			.catch(console.error);
	},
};
