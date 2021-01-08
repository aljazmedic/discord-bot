import { DiscordAPIError } from "discord.js";
import CliInterface from ".";
import Bot from "..";

export default function(cli:CliInterface, bot:Bot, args:string[]){
    const id = args[0];
    console.log(id)
    return bot.guilds.fetch(id).then(g=>{
        cli.workonGuild = g;
        return `Set active guild to: ${g.name}`
    }).catch(e=>{
        if(e instanceof DiscordAPIError){
            return e.toString();
        }
        console.error(e)
        return `Invalid id: ${id}`
    })
}