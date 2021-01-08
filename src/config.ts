import { OnlyDict } from "./middleware/filters";
import fs from 'fs'
import { config as dotenv } from 'dotenv'
import { resolve } from "app-root-path";
dotenv();
const { NODE_ENV = 'production' } = process.env;
const cfgPath = resolve('config/config.json');
const cfgFileStat = fs.existsSync(cfgPath);
let config: Configuration = cfgFileStat ? require(cfgPath)[NODE_ENV] || {} : {};
if (!config) {
    const { DISCORD_BOT_TOKEN,
        DISCORD_BOT_PREFIX,
        DISCORD_BOT_SQL_DB,
        DISCORD_BOT_SQL_USER,
        DISCORD_BOT_SQL_PASS,
        DISCORD_BOT_SQL_DIALECT,
        DISCORD_BOT_SQL_HOST,
        DISCORD_BOT_URBAN,
        DISCORD_BOT_SQL_PORT } = process.env;
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
    if (DISCORD_BOT_SQL_DIALECT != "mysql" && DISCORD_BOT_SQL_DIALECT != "sqlite" &&
        DISCORD_BOT_SQL_DIALECT != "postgres") {
        throw new Error(`Invalid sql dialect!`)
    }
    config = {
        sql: {
            database: DISCORD_BOT_SQL_DB,
            dialect: DISCORD_BOT_SQL_DIALECT,
            host: DISCORD_BOT_SQL_HOST,
            username: DISCORD_BOT_SQL_USER,
            password: DISCORD_BOT_SQL_PASS,
            port: DISCORD_BOT_SQL_PORT,
        },
        discord_token: DISCORD_BOT_TOKEN,
        prefix: DISCORD_BOT_PREFIX,
        urban_token: DISCORD_BOT_URBAN
    }
}
if (!config) throw new Error(`Could not get config: ${NODE_ENV}`)
if (!config.sql) throw new Error(`Could not get sql config: ${NODE_ENV}`)
if (!config.discord_token) throw new Error(`Could not get discord config: ${NODE_ENV}`)
const { sql, discord_token } = config;
export default config;
export { sql, discord_token };

export type Configuration = {
    readonly sql: {
        database: string;
        username: string;
        password?: string;
        host: string;
        dialect: "mysql" | "postgres" | "sqlite";
        port?: string;
        other?: {
            [key: string]: string
        }
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