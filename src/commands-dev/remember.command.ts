import { Client, Message } from "discord.js";
import { CommandParameters } from "../Bot/Command";

export default {
	name: "remember", //name of the command

	aliases: ["ram"],

	run: (msg:Message, client:Client, params:CommandParameters) => {
        //final function
        console.log(params)
        params.context?.create('ram-id:5', params.args)
        .then(()=>{
            msg.reply("remembered " + params.args);
        }).catch(console.error)
	},
};
