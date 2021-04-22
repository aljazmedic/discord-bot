import { Column, Table, Model, DataType, PrimaryKey, AutoIncrement } from "sequelize-typescript";


@Table({ timestamps: false, charset: 'utf8', collate: 'utf8_general_ci' })
export default class Wisdom extends Model {

    @Column(DataType.STRING)
    public text: string;

}
