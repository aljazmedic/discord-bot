import { Message } from "discord.js";
import Bot, { Command } from "../Bot";
import { CommandParameters } from "../Bot/Command";


export default class Remove extends Command{

    constructor(){
        super();
        this.name = "rm"
        this.alias("rmc","rmr")
        this.before((msg,client,bot)=>{
            msg.author.id == ""
        })
    }
    run(msg:Message, client:Bot, params:CommandParameters){
        
    }
}