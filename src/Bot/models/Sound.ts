

import { Column, DataType, Table, Model } from "sequelize-typescript";

@Table({ timestamps: false })
export default class Sound extends Model<Sound>
{

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