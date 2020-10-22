import { Guild  } from "discord.js";

import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface JokeReplyAttributes {
    id: number;
    replyText: string;
    position: number;
    triggerRegex:string;
}
export interface JokeReplyModel extends Model<JokeReplyAttributes>, JokeReplyAttributes {}
export class JokeReply extends Model<JokeReplyModel, JokeReplyAttributes> {}

export type JokeReplyStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): JokeReplyModel;
};

export function JokeReplyFactory (sequelize: Sequelize): JokeReplyStatic {
    return <JokeReplyStatic>sequelize.define("JokeReplys", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        replyText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        position: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        triggerRegex:{
            type:DataTypes.STRING,
        }
    }, {timestamps:false});
}
