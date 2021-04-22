import { Client, Message, Guild, ReactionEmoji } from "discord.js";
import { Sequelize } from "sequelize-typescript";
import { WhereAttributeHash } from "sequelize/types";
import Bot from "../../Bot";
import Command, { CommandFunction, CommandMessage, CommandResponse, MethodRun } from "../../Bot/Command";
import { GuildDB, Wisdom } from "../../Bot/models";
import { getLogger } from '../../logger';
const logger = getLogger(__filename);



const addHandler: MethodRun = (msg, bot, res) => {
    if (!msg.args.length) {
        res.dmReply("Missing the wisdom you want to add");
        return;
    }
    const authorInfo = `[${msg.author.id}] ${msg.author.username}`
    const guildInfo = msg.guild ? `[${msg.guild.id}] ${msg.guild.name}` : "No guild."
    const messageLink = msg.guild ? `https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}` : "No link."

    const toAdd = msg.args.join(" ");
    const prompt = `${authorInfo}\n${guildInfo}\n${messageLink}\n\`\`\`${msg.content}\`\`\`Wants to add:\n'${toAdd}'`
    bot.askOwner(prompt).then((v) => {
        if (v)
            return Wisdom.create({
                text: toAdd
            })
        return Promise.resolve(null)
    }).then((createdWisdom) => {
        if (createdWisdom) {
            res.dmReply(`Added YOUR wisdom proposal:'${createdWisdom.text}'. The id is ${createdWisdom.id}`);
        } else {
            res.dmReply(`Your wisdom proposal didn't make it`)
        }
    })
}

export default class Modrost extends Command {
    constructor() {
        super("modrost");
        this.alias("pregovor", "pamet", "wisdom")
        this.description = 'Beri in se uči';
        this.on("add", addHandler);
    }

    run(msg: CommandMessage, bot: Bot, res: CommandResponse) {
        const id = parseInt(<string>msg.args.pop() || "");
        console.log(id);
        const where: WhereAttributeHash = Number.isInteger(id) ? {
            id
        } : {};
        Wisdom.findAll({
            order: Sequelize.literal('rand()'), limit: 1, where
        }).then((v) => {
            if (v.length) {
                res.channelReply(v[0].text);
            } else {
                res.channelReply("No wisdoms found")
            }
        }).catch(err => logger.error(err))
    }
};