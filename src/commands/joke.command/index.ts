import { Collector, CollectorFilter, Message, MessageCollector } from "discord.js";
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
            .createMessageCollector(thisPart.f, { time: 10000 })
        col.on('end', () => {
            console.log("Expired for " + thisPart.rgx)
            /* if (Math.random() < 0.3) {
                _msg.reply("whatever...")
            } */
        })
            .on('collect', (collected: Message) => {
                if (idx == jokeParts.length) {
                    //Mention for the last one
                    collected.reply(thisPart.r)
                } else {
                    collected.channel.send(thisPart.r)
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
        this.aliases = ['knockknock', 'j']
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
                console.log(joke)
                let jokeStart: string = joke.jType.replyText;
                console.log(jokeStart)
                const jokeParts: JokePart[] = joke.getDataValue("replies")
                    .sort((e1: JokeReplyDB, e2: JokeReplyDB) => e1.getDataValue("position") - e2.getDataValue("position")) //sequelize ne dela
                    .map((jr: JokeReplyDB): JokePart => {
                        const rgx = jr.getDataValue('triggerRegex') == null ? null : new RegExp(jr.getDataValue('triggerRegex'), 'i');
                        const rply = jr.getDataValue('replyText');
                        return {
                            r: rply,
                            f: (_msg) => _msg.content.match(rgx) && _msg.channel.id == msg.channel.id && _msg.author.id == msg.author.id,
                            rgx,
                            directPrint: jr.getDataValue('triggerRegex') == null
                        }
                    })
                console.table(jokeParts)
                while (jokeParts.length > 0 && jokeParts[0].directPrint) {
                    const firstPart = <JokePart>jokeParts.shift()
                    jokeStart += " " + firstPart.r;
                }
                msg.channel.send(jokeStart).then((botMsg) => messageCollectorForJoke(botMsg, jokeParts))
            })
    }
}

export type JokePart = { f: CollectorFilter, r: string, rgx: RegExp|null, directPrint: boolean }