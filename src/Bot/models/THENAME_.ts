import { Guild  } from "discord.js";

import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface THENAME_Attributes {
    id: number;
    name: string;
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface THENAME_Model extends Model<THENAME_Attributes>, THENAME_Attributes {}
export class THENAME_ extends Model<THENAME_Model, THENAME_Attributes> {}

export type THENAME_Static = typeof Model & {
    new (values?: object, options?: BuildOptions): THENAME_Model;
};

export function THENAME_Factory (sequelize: Sequelize): THENAME_Static {
    return <THENAME_Static>sequelize.define("THENAME_s", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    });
}
