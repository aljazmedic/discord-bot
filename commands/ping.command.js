export default {
	name: "ping", //name of the command

	before: [], // middleware functions

	aliases: ["testp"],

	run: (msg, client, params) => {
		//final function
		console.log(params);
		msg.reply("pong");
	},
};
