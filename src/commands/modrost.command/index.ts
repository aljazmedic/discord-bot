import { Sequelize } from "sequelize-typescript";
import { WhereAttributeHash } from "sequelize/types";
import Bot from "../../Bot";
import Command, { CommandMessage, CommandResponse, MethodRun } from "../../Bot/Command";
import { Wisdom } from "../../Bot/models";
import { getLogger } from '../../logger';
const logger = getLogger(__filename);

const { fn, col } = Sequelize;

export default class Modrost extends Command {
    constructor() {
        super("modrost");
        this.alias("pregovor", "pamet", "wisdom")
        this.description = 'Beri in se uči';
        this.on("add", addHandler);
        this.on("me", meHandler);
    }

    run(msg: CommandMessage, bot: Bot, res: CommandResponse) {
        const id = parseInt(<string>msg.args.pop() || "");
        console.log(id);
        const where: WhereAttributeHash = Number.isInteger(id) ? {
            id
        } : {};
        if (msg.trigger.caller == "pregovor") {
            //Only the authentic ones
            where.author_id = null;
        }
        Wisdom.findAll({
            order: Sequelize.literal('rand()'), limit: 1, where
        }).then((v) => {
            if (v.length) {
                const wis = v[0];
                res.channelReply(wis.text);
                if (wis.emoji)
                    setTimeout(() => {
                        res.channelReply(`${v[0].emoji}`)
                    }, 900);
            } else {
                res.channelReply("No wisdoms found")
            }
        }).catch(err => logger.error(err))
    }
};

const emojiRegex = /(\<\:[\w\d]+\:\d+\>)|(\:[\w\d]+\:)/gi;

const addHandler: MethodRun = (msg, bot, res) => {
    const messageLink = msg.guild ? `https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}` : "No link."
    if (!msg.args.length) {
        res.dmReply(`Missing the wisdom you want to add in ${messageLink}`);
        return;
    }
    const authorInfo = `[${msg.author.id}] ${msg.author.username}`
    const guildInfo = msg.guild ? `[${msg.guild.id}] ${msg.guild.name}` : "No guild."

    const rejoined = msg.args.join(" ");
    const toAdd = rejoined.replace(/\`\`\`/g, "\n").replace(emojiRegex, "").trim();
    const emojiMatches = rejoined.match(emojiRegex)
    const lastEmoji = (emojiMatches) ? emojiMatches.pop() : null;

    const prompt = `${authorInfo}\n${guildInfo}\n${messageLink}\n\`\`\`${msg.content}\`\`\`Wants to add:\n'${toAdd}'\nEmoji:${lastEmoji}`
    const q = toAdd.replace(/[ \n\t\,\.\']+/g, "").toUpperCase();
    //Count wisdoms matching
    Wisdom.count({
        where: Sequelize.where(fn("upper", fn("replace", col("text"), " ", "")), q)
    }).then((n) => {
        if (n == 0)
            return bot.askOwner(prompt).then((v) => {
                if (v)
                    return Wisdom.create({
                        text: toAdd,
                        author_id: msg.author.id,
                        emoji: lastEmoji
                    })
                return Promise.resolve(null)
            }).then((createdWisdom) => {
                if (createdWisdom) {
                    res.dmReply(`Added YOUR wisdom proposal:'${createdWisdom.text}'. The id is ${createdWisdom.id}`);
                } else {
                    res.dmReply(`Your wisdom proposal didn't make it`)
                }
            })
        res.dmReply(`There already exists wisdom-a-like to\n${toAdd}\nin my database`)
    })
        .catch(err => logger.error(err))
}


const meHandler: MethodRun = (msg, bot, res, next) => {
    Wisdom.findAll({
        where: {
            author_id: msg.author.id
        }
    }).then((rows) => {
        if (rows.length == 0) {
            res.msgReply("you haven't contributed yet!")
            return;
        }
        const wisdoms = rows.map((w) => `\`${w.text}\``).join("\n");
        const respText = `You contributed:\n${wisdoms}`;
        res.channelReply(respText)
    })
        .catch(err => logger.error(err))
}
