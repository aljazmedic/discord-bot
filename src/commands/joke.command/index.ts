import { Collector, CollectorFilter, Message, MessageCollector } from "discord.js";
import Bot, { Command } from "../../Bot";
import { CommandParameters } from "../../Bot/Command";
import { JokeDB, JokeTypeDB, JokeReplyDB } from "../../Bot/models";
import { JokeReply, } from "../../Bot/models/JokeReply";
import Sequelize from 'sequelize';

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
        console.log(msg);
        JokeDB.findOne({ order: Sequelize.fn("rand"), include: [{ model: JokeTypeDB }, { model: JokeReplyDB, as: 'replies', order: ['position', 'asc'] }] }).then((joke: any) => {
            if (!joke) return;
            let jokeStart: string = joke.JokeType.replyText;
            const jokeParts: JokePart[] = joke.replies
                .sort((e1: JokeReply, e2: JokeReply) => e1.getDataValue("position") - e2.getDataValue("position")) //sequelize ne dela
                .map((jr: JokeReply): JokePart => {
                    const rgx = new RegExp(jr.getDataValue('triggerRegex'), 'i');
                    const rply = jr.getDataValue('replyText');
                    return {
                        r: rply,
                        f: (_msg) => _msg.content.match(rgx) && _msg.channel.id == msg.channel.id && _msg.author.id == msg.author.id,
                        rgx,
                        directPrint: jr.getDataValue('triggerRegex') == null
                    }
                })
            while (jokeParts.length > 0 && jokeParts[0].directPrint) {
                const firstPart = <JokePart>jokeParts.shift()
                jokeStart += " " + firstPart.r;
            }
            msg.channel.send(jokeStart).then((botMsg) => messageCollectorForJoke(botMsg, jokeParts))
        })
    }
}

export type JokePart = { f: CollectorFilter, r: string, rgx: RegExp, directPrint: boolean }