import { OnlyDict } from "./middleware/filters";

const { NODE_ENV = 'production' } = process.env;
const config: Configuration = require('../config/config.json')[NODE_ENV] || {};


if (!config) throw new Error(`No such conifg: ${NODE_ENV}`)

const { sql, discord_token } = config;
export default config;
export { sql, discord_token };

export type Configuration = {
    readonly sql: {
        readonly database: string;
        readonly username: string;
        readonly password?: string;
        readonly host: string;
        readonly dialect: 'mysql' | 'sqlite'
    },
    readonly discord_token: string;
    readonly prefix: string;
    readonly urban_token: string;
    readonly logger?: {
        readonly consoleLevel: string
    };
    readonly commandIgnore?: OnlyDict;
    readonly developers?: DevInfo[];
}

export type DevInfo = {
    id: string;
    nick: string;
}