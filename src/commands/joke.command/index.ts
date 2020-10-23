import { CollectorFilter, Message } from "discord.js";
import Bot, { Command } from "../../Bot";
import { CommandParameters } from "../../Bot/Command";
import { JokeDB, JokeTypeDB, JokeReplyDB } from "../../Bot/models";
import { Sequelize } from 'sequelize-typescript';


const messageCollectorForJoke = (msg: Message, jokeParts: JokePart[]) => {
    let idx = 0;

    (function next(_msg: Message) {
        if (idx >= jokeParts.length) return;

        const thisPart = jokeParts[idx++];
        console.log("IDX ", idx - 1, "\nExpecting ", thisPart.rgx);
        const col = _msg.channel
            .createMessageCollector(thisPart.msgFilter, { time: 10000 })
        col.on('end', () => {
            console.log("Expired for " + thisPart.rgx)
        })
            .on('collect', (collected: Message) => {
                if (idx == jokeParts.length) {
                    //Mention for the last one
                    collected.reply(thisPart.replyText)
                } else {
                    collected.channel.send(thisPart.replyText)
                }
                col.stop();
                next(collected);
            })
    })(msg);
}

export default class Joke extends Command {
    constructor() {
        super();
        this.name = 'joke';
        this.alias('knockknock', 'j')
    }
    run(msg: Message, client: Bot, params: CommandParameters) {
        JokeDB.findAll({
            order: Sequelize.fn('rand'),
            limit: 1,
            include: [
                {
                    model: JokeReplyDB,
                    as: 'replies'
                },
                {
                    model: JokeTypeDB
                }
            ],
        }
        )
            .then((jokes: JokeDB[]) => {
                if (jokes.length == 0) return;
                const joke = jokes[0];
                let jokeStart: string = joke.jType.replyText;
                const jokeParts: JokePart[] = joke.getDataValue("replies")
                    .sort((e1: JokeReplyDB, e2: JokeReplyDB) => e1.getDataValue("position") - e2.getDataValue("position")) //sequelize ne dela
                    .map((jr: JokeReplyDB): JokePart => {
                        const rgx = jr.getDataValue('triggerRegex') == null ? null : new RegExp(jr.getDataValue('triggerRegex'), 'i');
                        const rply = jr.getDataValue('replyText');
                        return {
                            replyText: rply,
                            msgFilter: (_msg) => _msg.content.match(rgx) && _msg.channel.id == msg.channel.id && _msg.author.id == msg.author.id,
                            rgx,
                            directPrint: jr.getDataValue('triggerRegex') == null
                        }
                    })
                console.table(jokeParts)
                while (jokeParts.length > 0 && jokeParts[0].directPrint) {
                    const firstPart = <JokePart>jokeParts.shift()
                    jokeStart += " " + firstPart.replyText;
                }
                msg.channel.send(jokeStart).then((botMsg) => messageCollectorForJoke(botMsg, jokeParts))
            })
    }
}

export type JokePart = { msgFilter: CollectorFilter, replyText: string, rgx: RegExp | null, directPrint: boolean }