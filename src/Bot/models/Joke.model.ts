import { Guild } from "discord.js";

import { BelongsTo, Column, HasMany, Table, Model, ForeignKey, DataType } from "sequelize-typescript";
import JokeReply from "./JokeReply.model";
import JokeType from "./JokeType.model.";


@Table({ timestamps: false })
export default class Joke extends Model {

    @BelongsTo(() => JokeType, { foreignKey: 'jtype_id' })
    public jType: JokeType;

    @ForeignKey(() => JokeType)
    @Column
    public jtype_id: number;

    @HasMany(() => JokeReply, { foreignKey: 'joke_id', as: 'replies' })
    public replies: JokeReply[] = [];

    @Column({ type: DataType.INTEGER })
    public api_id: number;
/*  //TODO
    @HasMany(() => JokeVote, { foreignKey: 'joke_id', as: 'votes' })
    public votes:JokeVote[]; */
}
