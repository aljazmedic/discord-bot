import { reject, resolve } from "bluebird";
import { Guild as dGuild, GuildEmojiManager } from "discord.js";

import { DataType, Model, Column, Table, Default, PrimaryKey, HasMany } from "sequelize-typescript";
import Team from "./Team.model";
import TeamPlayer from "./TeamPlayer.model";

@Table({ timestamps: false, charset: 'utf8', collate:'utf8_general_ci' })
export default class Guild extends Model<Guild>{

    @PrimaryKey
    @Column(DataType.STRING)
    public id: string;

    @Column({ type: DataType.STRING, primaryKey: true })
    public name!: string;

    @Column({ type: DataType.STRING })
    public role_cid!: string;


    @HasMany(() => Team, { foreignKey: 'gid', as: 'teams' })
    public teams: Team;



    //VOTING

    @Default(":+1:") //👍
    @Column({ type: DataType.STRING })
    public upvote_emoji: string;

    @Default(":-1:") //👎
    @Column({ type: DataType.STRING })
    public downvote_emoji: string;

    static fetch(guild: dGuild) {
        const [upvote_emoji, downvote_emoji] = findGuildVotingEmojis(guild.emojis)
        console.log(guild.id)
        return Guild.findOrCreate({
            where: {
                id: guild.id,
            }, defaults: {
                id: guild.id,
                name: guild.name,
                upvote_emoji, downvote_emoji
            }
        });
    }
}

export function findGuildVotingEmojis(g: GuildEmojiManager): [string, string] {
    //Begin upvote
    let upvote = undefined;
    const upvoteSearch = ["upvote", "+1"];
    let idx = 0;
    while (upvote == undefined && idx < upvoteSearch.length) {
        console.log(upvote)
        upvote = g.cache.find((e) => e.name == upvoteSearch[idx++])?.id
    };
    if (upvote == undefined)
        upvote = "👍";


    let downvote = undefined;
    const downvoteSearch = ["downvote", "-1"];
    idx = 0;
    while (downvote == undefined && idx < downvoteSearch.length) downvote = g.cache.find((e) => e.name == downvoteSearch[idx++])?.id;
    if (downvote == undefined)
        downvote = "👎";
    return [upvote, downvote];
}