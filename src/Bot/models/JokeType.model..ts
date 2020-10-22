import { Column, Table, Model, DataType, HasMany, ForeignKey } from "sequelize-typescript";
import Joke from "./Joke.model";


@Table({ timestamps: false })
export default class JokeType extends Model {

    @Column({ type: DataType.STRING, allowNull: false })
    public replyText: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    public type: string;

    @HasMany(() => Joke, { foreignKey: 'jtype_id' })
    public jokes: Joke[] = []
}