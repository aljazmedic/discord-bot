import { Guild as dGuild } from "discord.js";

import { Model, Column, Table } from "sequelize-typescript";
import { DataTypes } from "sequelize";

@Table({ timestamps: false })
export default class Guild extends Model<Guild>{

    @Column({ type: DataTypes.STRING, primaryKey: true })
    public name!: string;

    @Column({ type: DataTypes.STRING })
    public role_cid!: string;
}
