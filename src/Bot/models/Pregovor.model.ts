import { Column, Table, Model, DataType, PrimaryKey } from "sequelize-typescript";


@Table({ timestamps: false, charset: 'utf8', collate: 'utf8_general_ci' })
export default class Wisdom extends Model {

    @PrimaryKey
    @Column(DataType.INTEGER)
    public pregovor_id: number;

    /* @HasMany(() => JokeReply, { foreignKey: 'joke_id', as: 'replies' })
    public replies: JokeReply[] = []; */

    @Column(DataType.STRING)
    public besedilo: string;

}
