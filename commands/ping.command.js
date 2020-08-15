export default {
	name: "ping", //name of the command

	aliases: ["testp"],

	run: (msg, client, params) => {
		//final function
		

		
        console.log(msg)
		console.log(params.contextManager.getContext(msg, 'ram-id:5'))
		msg.reply("pong");
	},
};
