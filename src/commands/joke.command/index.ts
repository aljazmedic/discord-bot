import Bot, { Command } from "../../Bot";
import axios from 'axios';
import { CommandMessage, CommandResponse } from "../../Bot/Command";
import { getLogger } from '../../logger'
const logger = getLogger(__filename);

export default class Joke extends Command {
    constructor() {
        super('joke');
        this.description = "Made with https://jokeapi.dev."
        this.alias('j', 'funny', 'imsad');
    }
    run(msg: CommandMessage, client: Bot, res: CommandResponse) {
        let blacklistFlags = "";//msg.channel.nsfw ? "" : "nsfw,political,racist,sexist";

        axios({
            url: "https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Dark,Pun",
            params: {
                type: "any",
                blacklistFlags
            },
            method: "GET"
        })
            .then((r) => {
                const responseJson = r.data;
                if (responseJson.error) {
                    return res.channelReply(`Cannot access https://jokeapi.dev :frowning:`);
                }
                const type: jokeType = responseJson.type;
                switch (type) {
                    case "twopart":
                        res.channelReply(responseJson.setup);
                        setTimeout(() => {
                            res.channelReply(responseJson.delivery)
                        }, 3 * 1000)
                        return;
                    default:
                        res.channelReply(responseJson.joke);
                        return;
                }
            }).catch(err => {
                logger.error(err);
            })
    }
}

type jokeType = "single" | "any" | "twopart";