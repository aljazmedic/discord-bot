import { Guild } from "discord.js";

import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface SoundAttributes {
    id: string;
    name: string;
    src: string;
    ext: string;
    end?: string;
    start?: string;
    hash: string;
}
export interface SoundModel extends Model<SoundAttributes>, SoundAttributes { }
export class Sound extends Model<SoundModel, SoundAttributes> { }

export type SoundStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): SoundModel;
};

export function soundFactory(sequelize: Sequelize): SoundStatic {
    return <SoundStatic>sequelize.define("sounds", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        src: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        ext: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'mp3'
        },
        hash:{
            type: DataTypes.STRING,
        },
        start: {
            type: DataTypes.STRING,
        },
        end: {
            type: DataTypes.STRING,
        }
    }, { timestamps: false });
}
