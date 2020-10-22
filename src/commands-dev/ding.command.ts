/* eslint-disable no-unused-vars */

import { Client, Message } from "discord.js";
import { CommandParameters } from "../Bot/Command";

export default {
    name: 'ding',
    aliases:['dong', 'ching'],
	before: [],
	description:"www.racistanswer.com",
	run: function(msg:Message, client:Client, params:CommandParameters) {
		//final function
		msg.reply('long dong ching chong');
	},
};
