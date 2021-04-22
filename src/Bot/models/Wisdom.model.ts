import { Column, Table, Model, DataType, PrimaryKey, AutoIncrement, AllowNull } from "sequelize-typescript";


@Table({ timestamps: false, charset: 'utf8', collate: 'utf8_general_ci' })
export default class Wisdom extends Model {

    @Column(DataType.STRING)
    public text: string;

    @AllowNull
    @Column(DataType.STRING)
    public author_id: string;
}
