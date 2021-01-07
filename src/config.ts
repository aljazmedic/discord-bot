import { OnlyDict } from "./middleware/filters";
import fs from 'fs'
const { NODE_ENV = 'production' } = process.env;
const cfgPath = '../config/config.json';
const cfgFileStat = fs.existsSync(cfgPath);
let config: Configuration;
if (cfgFileStat) {
    config = require(cfgPath)[NODE_ENV] || {};
    if (!config) throw new Error(`No such conifg: ${NODE_ENV}`)
} else {
    const { DISCORD_BOT_TOKEN,
        DISCORD_BOT_PREFIX,
        DISCORD_BOT_SQL_DB,
        DISCORD_BOT_SQL_USER,
        DISCORD_BOT_SQL_PASS,
        DISCORD_BOT_SQL_DIALECT,
        DISCORD_BOT_SQL_HOST,
        DISCORD_BOT_URBAN } = process.env;
    if (!(DISCORD_BOT_TOKEN &&
        DISCORD_BOT_PREFIX &&
        DISCORD_BOT_SQL_DB &&
        DISCORD_BOT_SQL_USER &&
        DISCORD_BOT_SQL_PASS &&
        DISCORD_BOT_SQL_DIALECT &&
        DISCORD_BOT_SQL_HOST &&
        DISCORD_BOT_URBAN)) {
        throw new Error(`Missing configuration in environment and config.json!`)
    }
    config = {
        sql: {
            database: DISCORD_BOT_SQL_DB,
            dialect: DISCORD_BOT_SQL_DIALECT,
            host: DISCORD_BOT_SQL_HOST,
            username: DISCORD_BOT_SQL_USER,
            password: DISCORD_BOT_SQL_PASS
        },
        discord_token: DISCORD_BOT_TOKEN,
        prefix: DISCORD_BOT_PREFIX,
        urban_token: DISCORD_BOT_URBAN
    }
}


const { sql, discord_token } = config;
export default config;
export { sql, discord_token };

export type Configuration = {
    readonly sql: {
        readonly database: string;
        readonly username: string;
        readonly password?: string;
        readonly host: string;
        readonly dialect: string;
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