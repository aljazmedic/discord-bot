import { DMChannel, Guild, Message, MessageEmbed, MessageReaction, TextChannel, User } from "discord.js";
import { AfterCreate, AfterSave, AfterUpdate, BeforeSave, BelongsTo, Column, DataType, ForeignKey, IsIn, Model, Table } from "sequelize-typescript";
import Bot from "..";
import { getLogger } from "../../logger";
import RPSGame from "./RPSGame.mode";

const logger = getLogger(__filename);

@Table({ timestamps: false, charset: 'utf8', collate: 'utf8_general_ci' })
export default class RPSPlayer extends Model {

    @Column(DataType.STRING)
    public uid: string;

    @IsIn([['rock', 'paper', 'scissors']])
    @Column({ type: DataType.STRING })
    public picked: string;

    @ForeignKey(() => RPSGame)
    @Column(DataType.INTEGER)
    public game_id: number;

    @BelongsTo(() => RPSGame, { foreignKey: 'game_id' })
    public game: RPSGame;

    static addUserToGame(u: User, g: RPSGame) {
        return RPSPlayer.create({
            uid: u.id,
            game_id: g.id
        })
    }

    promptUser(client: Bot, resultChannel: TextChannel | DMChannel) {
        const emojis = ["✂", "🗞", "🪨"]
        const emojisEsc = ["\:rock:", "\:newspaper2:", "\:scissors:"]
        const last = emojisEsc.pop();
        const emojiString = `${emojisEsc.join(', ')} or ${last}`;
        const self = this;
        client.users.fetch(this.uid).then((u) => u.createDM())
            .then(dm => dm.send(`React with one of the emojis. ${emojiString}`))
            .then(msg => {
                const collector = msg.createReactionCollector((reaction: MessageReaction, user: User) =>
                    emojis.includes(reaction.emoji.name) && !user.bot
                );
                collector.on('collect', (reaction) => {
                    let picked = undefined;
                    switch (reaction.emoji.name) {
                        case "✂": picked = "scissors"; break;
                        case "🗞": picked = "paper"; break;
                        case "🪨": picked = "rock"; break;
                    }
                    if (picked)
                        (<RPSPlayer>self).update({
                            picked
                        }).then((r) => {
                            const a = r.game.players.filter(p => p.picked);
                            if (a.length == r.game.players.length) {
                                //All players have selected
                                r.game.resolveGame(client, resultChannel);
                            }
                            msg.delete({ timeout: 10000 }).catch(e => {
                                logger.warn(`Message ${msg.id} already deleted!`)
                            })
                        })
                })
                return Promise.all(emojis.map(e => msg.react(e)))
            })
    }

    @AfterSave
    static async checkOthers(instance: RPSPlayer, options: any): Promise<RPSPlayer> {
        const newInstance = await instance.reload({ include: [{ model: RPSGame, include: [RPSPlayer] }], transaction: options.transaction })
        return newInstance;
    }
}
