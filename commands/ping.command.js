export default {
	name: "ping", //name of the command

	aliases: ["testp"],

	run: (msg, client, params) => {
		//final function
		

		
        console.log(msg)
		console.log(params.context.get('ram-id:5'))
		msg.reply("pong");
	},
};
