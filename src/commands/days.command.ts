import { Client, Message } from "discord.js";
import Command, { CommandParameters } from "../Bot/Command";

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


export default class Days extends Command {
    constructor(){
        super();
        this.name= "days", //name of the command
        this.alias("whichday","weekday","dan")
    }

	run(msg:Message, client:Client, params:CommandParameters) {
        //final function
        const numday = new Date().getDay();
        let message;
        switch(numday){
            case 3:
                message="It's wednesday my dudes"
                break;
            default:
                message=`It's ${days[numday]}`
        }
		msg.channel.send(message);
	}
};
