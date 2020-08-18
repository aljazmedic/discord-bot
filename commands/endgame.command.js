export default {
	name: 'endgame', //name of the command

	aliases: ['endteams'],

	run: (msg, client, params) => {
		//final function
		const contextData = params.context.get(
			'gameTeams',
			{
				iA: true,
			},
		) ||{};
		const { roles = [], channels = [], renames = {} } = contextData;

		roles.forEach((role) => {
			const rol = msg.guild.roles.cache.get(role);
			if (rol) rol.delete();
		});
		channels.forEach((channel) => {
			const chnl = msg.guild.channels.cache.get(channel);
			if (chnl) chnl.delete();
		});
		Object.entries(renames).map(([memberId, { oldNick=null, thisNick=null }]) => {
			const member = msg.guild.members.cache.get(memberId);
			if(!member) return;
			const displayName = member.nickname || member.user.username;
			if (displayName == thisNick)
				//If already renamed don't change
				member.setNickname(oldNick);
		});
		params.context.create('gameTeams', undefined, {
			iA: true,
		});
	},
};
