

import { Column, DataType, Table, Model, PrimaryKey } from "sequelize-typescript";

@Table({ timestamps: false, charset: 'utf8', collate:'utf8_general_ci' })
export default class Sound extends Model {

    @PrimaryKey
    @Column(DataType.STRING)
    public id:string;

    @Column({ type: DataType.STRING, allowNull: false })
    public src: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    public name: string;

    @Column({ type: DataType.STRING, defaultValue: "mp3", allowNull: false })
    public ext: string;

    @Column({ type: DataType.STRING })
    public hash?: string;

    @Column({ type: DataType.STRING })
    public start?: string;

    @Column({ type: DataType.STRING })
    public end?: string;

}