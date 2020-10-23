import { BelongsTo, Column, Table, Model, DataType, ForeignKey, ModelClassGetter } from "sequelize-typescript";
import Joke from "./Joke.model";

@Table({ timestamps: false, charset: 'utf-8', collate:'utf8_general_ci' })
export default class JokeReply extends Model {

    @Column({ type: DataType.STRING, allowNull: false })
    public replyText: string;

    @Column({ type: DataType.INTEGER })
    public position: number;

    @Column({ type: DataType.STRING })
    public triggerRegex: string;

    @ForeignKey(() => Joke)
    @Column
    public joke_id: number;

    @BelongsTo(() => Joke, { foreignKey: 'joke_id' })
    public joke: Joke;

}

