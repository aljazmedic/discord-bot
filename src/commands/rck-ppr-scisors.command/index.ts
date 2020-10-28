import { Message, MessageReaction, User } from "discord.js";
import { Sequelize } from "sequelize/types";
import Bot, { Command } from "../../Bot";
import { CommandMessage, CommandResponse } from "../../Bot/Command";
import { RPSGame, sequelize } from "../../Bot/models";
import RPSPlayer from "../../Bot/models/RPSPlayer.model";
import { getLogger } from "../../logger";
const logger = getLogger(__filename)

export default class RPS extends Command {
    constructor() {
        super("rps")
        this.alias('prs', 'kšp', 'kšl', 'pkš', 'spr')
        this.description = "Simple game of rock, *papir*, scis5ior"
    }
    run(triggerMessage: CommandMessage, client: Bot, res: CommandResponse) {
        RPSGame.create({
            mid: triggerMessage.id,
            guild_id: triggerMessage.guild!.id,
            players: [
                {
                    uid: triggerMessage.author.id,
                }
            ]
        }, { include: [RPSPlayer] })
            .then(game => {
                res.useModifier((responded: Message) => {
                    const videoGameEmoji = client.emojis.resolveID('🎮');
                    responded.react(videoGameEmoji!)
                        .then((addedReaction) => {
                            const collector = responded
                                .createReactionCollector((reaction: MessageReaction, user: User) =>
                                    (reaction.emoji.id == addedReaction.emoji.id) && !user.bot && user.id != triggerMessage.author.id, { maxEmojis: 2, maxUsers: 2, max: 2 })
                            collector.on('collect',
                                (reaction, user) => {
                                    RPSPlayer.addUserToGame(user, game).then(rpsPlayer => {
                                        logger.info(rpsPlayer)
                                        const { players, id: game_id, guild_id } = rpsPlayer.game;
                                        logger.info(`Players in (G:${guild_id}) Game #${game_id} - #Players: ${players.length}`)
                                        if (players.length == 2) {
                                            rpsPlayer.game.prompt(client, triggerMessage, responded)
                                        }
                                    })
                                })
                        })
                })
                return res.channelReply("Who wants to play?")
            })
    }
}