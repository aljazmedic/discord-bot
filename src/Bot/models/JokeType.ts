import { Guild  } from "discord.js";

import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface JokeTypeAttributes {
    id: number;
    replyText: string;
    type: string;
}
export interface JokeTypeModel extends Model<JokeTypeAttributes>, JokeTypeAttributes {}
export class JokeType extends Model<JokeTypeModel, JokeTypeAttributes> {}

export type JokeTypeStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): JokeTypeModel;
};

export function JokeTypeFactory (sequelize: Sequelize): JokeTypeStatic {
    return <JokeTypeStatic>sequelize.define("JokeTypes", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        replyText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:true
        },
    },{timestamps:false});
}
