import { Guild } from "discord.js";

import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";
import { JokeReply, JokeReplyModel, JokeReplyStatic } from "./JokeReply";
import { JokeTypeModel } from "./JokeType";

export interface JokeAttributes {
    id?: number;
    replies?: (JokeReplyModel | null)[],
    JokeTypeDB: JokeTypeModel | null
}
export interface JokeModel extends Model<JokeAttributes>, JokeAttributes { }
export class Joke extends Model<JokeModel, JokeAttributes> { }

export type JokeStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): JokeModel;
};

export function JokeFactory(sequelize: Sequelize): JokeStatic {
    return <JokeStatic>sequelize.define("Jokes", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    }, { timestamps: false });
}
