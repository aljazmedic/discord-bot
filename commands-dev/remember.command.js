export default {
	name: "remember", //name of the command

	aliases: ["ram"],

	run: (msg, client, params) => {
        //final function
        console.log(params)
        params.contextManager.createContext(msg, 'ram-id:5', params.args)
        .then(()=>{
            msg.reply("remembered " + params.args);
        }).catch(console.error)
	},
};
