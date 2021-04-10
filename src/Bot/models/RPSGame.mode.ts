import { DMChannel, Guild, Message, MessageEmbed, TextChannel } from "discord.js";
import { BelongsTo, Column, DataType, ForeignKey, HasMany, IsIn, Model, Table } from "sequelize-typescript";
import { GuildDB } from ".";
import Bot from "..";
import logger from "../../logger";
import RPSPlayer from "./RPSPlayer.model";

@Table({ timestamps: false, charset: 'utf8', collate: 'utf8_general_ci' })
export default class RPSGame extends Model {

    @Column(DataType.STRING)
    public mid: string;

    @HasMany(() => RPSPlayer, { foreignKey: 'game_id', as: 'players' })
    public players: RPSPlayer[];

    @BelongsTo(() => GuildDB, { foreignKey: 'guild_id' })
    public guild: GuildDB;

    @ForeignKey(() => GuildDB)
    @Column(DataType.STRING)
    public guild_id: string;

    @Column(DataType.STRING)
    public winner_uid: string;



    prompt(client: Bot, startMsg: Message, replyMsg: Message) {
        this.players.forEach((p => {
            p.promptUser(client, <TextChannel | DMChannel>startMsg.channel)
        }));
        replyMsg.delete().catch(e => {
            logger.warn(`Message ${startMsg.id} already deleted!`)
        })
        startMsg.delete().catch(e => {
            logger.warn(`Message ${startMsg.id} already deleted!`)
        })
    }

    resolveGame(client: Bot, resultChannel: TextChannel | DMChannel) {
        createEmbed(client, this).then(([msgEmbed, winner_uid]) =>
            this.update({ winner_uid }).then(() => resultChannel.send(msgEmbed))
                .then(() => resultChannel.send(this.players.map(p => `<@${p.uid}>`).join(', ')).then(m => m.delete({ timeout: 3000 })))
        )
    }
}
function createEmbed(c: Bot, g: RPSGame): Promise<[MessageEmbed, string | null]> {
    const wins: { [index: string]: string } = {
        'paper': 'scissors',
        'rock': 'paper',
        'scissors': 'rock',
    }
    const retEmbed = new MessageEmbed().setTitle("Rock, Paper, Scisors")
    let winner_uid: string | null = null;
    const { players } = g;

    const [p1, p2] = players;
    let winner = "Player ";
    if (p1.picked == wins[p2.picked]) {
        //p1 wins
        winner_uid = p1.uid;
        retEmbed.setDescription(`\:trophy: <@${p1.uid}> ${fmtPcked(p1.picked)} \:vs: ${fmtPcked(p2.picked)} <@${p2.uid}> `)
        winner += "1";
    } else if (p2.picked == wins[p1.picked]) {
        //p2 wins
        winner_uid = p2.uid;
        retEmbed.setDescription(`<@${p1.uid}> ${fmtPcked(p1.picked)} \:vs: \: ${fmtPcked(p2.picked)} <@${p2.uid}> \:trophy:`)
        winner += "2";
    } else {
        //tie
        retEmbed.setDescription(`\:second_place: <@${p1.uid}> ${fmtPcked(p1.picked)} \:vs:  ${fmtPcked(p2.picked)} <@${p2.uid}> \:second_place:`)
    }
    if (winner_uid) {
        return RPSGame.count({
            where: {
                winner_uid
            },
        }).then(n => {
            retEmbed.addField(`<@${winner_uid}> has won!`, `Total wins: ${n + 1}`)
            return Promise.resolve([retEmbed, winner_uid])
        })
    }

    retEmbed.addField('It\'s a tie!', 'no winners here!')
    return Promise.resolve([retEmbed, winner_uid])
}
const fmtPcked = (s: string) => {
    if (s == 'paper') return '\:newspaper2:';
    return `\:${s}:`
}

export type RPS = 'rock' | 'paper' | 'scissors'