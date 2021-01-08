import { OnlyDict } from "./middleware/filters";
import fs from 'fs'
import { resolve as resolveProjPath } from "app-root-path";
import XRegExp from "xregexp";



const { NODE_ENV = 'production' } = process.env;
if (NODE_ENV == "development") {
    require('dotenv').config();
    console.log("Parsing .env file")
}

const DEFAULT_PORT = undefined;
function parsePort(v: any) {
    if (!v) return DEFAULT_PORT;
    const p = parseInt(v)
    if (!p) return DEFAULT_PORT;
    return p;
}

function parseSqlUrl(database_url: string) {
    const re = XRegExp(`(?<protocol>\\w+)://(?<name>[\.\\w-]+):(?<password>[\.\\w-]+)@(?<host>[\.\\w-]+)(?:\:(?<port>\\d+))?/(?<database>[\.\\w-]+)`);
    const m = XRegExp.exec(database_url, re);
    if (!m) {
        return {};
    }
    const {
        database, protocol: dialect, host, name: username, password,
    }: { [keY: string]: string } = m;
    const port = parsePort(m.port);
    return {
        database,
        dialect, host, username,
        password, port,
    }
}

function getEnvSqlConfig() {
    const { DISCORD_BOT_SQL_DB,
        DISCORD_BOT_SQL_USER,
        DISCORD_BOT_SQL_PASS,
        DISCORD_BOT_SQL_DIALECT,
        DISCORD_BOT_SQL_HOST,
        DISCORD_BOT_SQL_PORT,
        DATABASE_URL } = process.env;

    if (DATABASE_URL) {
        //Try paarsing one-string info
        const data = parseSqlUrl(DATABASE_URL)
        if (data)
            return data;
    }

    if (!(DISCORD_BOT_SQL_DB &&
        DISCORD_BOT_SQL_USER &&
        DISCORD_BOT_SQL_PASS &&
        DISCORD_BOT_SQL_DIALECT &&
        DISCORD_BOT_SQL_HOST)) {
        throw new Error(`Missing sql configuration in environment and config.json!`)
    }
    if (DISCORD_BOT_SQL_DIALECT != "mysql" && DISCORD_BOT_SQL_DIALECT != "sqlite" &&
        DISCORD_BOT_SQL_DIALECT != "postgres") {
        throw new Error(`Invalid sql dialect!`)
    }
    const port = parsePort(DISCORD_BOT_SQL_PORT);
    return {
        database: DISCORD_BOT_SQL_DB,
        dialect: DISCORD_BOT_SQL_DIALECT,
        host: DISCORD_BOT_SQL_HOST,
        username: DISCORD_BOT_SQL_USER,
        password: DISCORD_BOT_SQL_PASS,
        port
    }
}

function getEnvConfig() {
    const mandatory_keys = {
        DISCORD_BOT_TOKEN: "discord_token",
        DISCORD_BOT_URBAN: "urban_token",
        DISCORD_BOT_PREFIX: "prefix"
    }

    const built: any = {}

    //Parse mandatory variables
    const missingVars: string[] = []
    Object.entries(mandatory_keys).forEach(([key, assign]) => {
        if (!(key in process.env)) {
            missingVars.push(key)
        } else {
            built[assign] = process.env[key]
        }
    });

    if (missingVars.length) {
        throw new Error(`Missing environment variables: ${missingVars.join(",")}`)
    }

    built.sql = getEnvSqlConfig();
    return built;
}

function getJsonSqlConfig(sqlDict: any) {
    if ("url" in sqlDict) {
        const sqlConfig = parseSqlUrl(sqlDict.url);
        if (sqlConfig) return sqlConfig;
        throw new Error("Invalid sql url string!")
    }
    const fields = [
        "database",
        "dialect",
        "host",
        "username",
        "password",
    ];
    fields.forEach(f => {
        if (!(f in sqlDict)) throw new Error(`Missing sql.${f} in file config.json`)
    })
    const {
        database,
        dialect,
        host,
        username,
        password
    } = sqlDict;
    const port = parseInt(sqlDict.port || "3306") || 3306
    return {
        database,
        dialect,
        host,
        username,
        password,
        port
    }
}


function getJsonConfig(jsonDict: any) {
    if (!(NODE_ENV in jsonDict)) return false;
    let envConfig = jsonDict[NODE_ENV];
    if (envConfig.sql == undefined) {
        throw new Error("No sql configuration!");
    }
    const sqlConfig = getJsonSqlConfig(envConfig.sql);
    envConfig.sql = sqlConfig;
    return envConfig;
}



function readConfig(): Configuration {
    const cfgPath = resolveProjPath('config/config.json');
    const cfgFileStat = fs.existsSync(cfgPath);
    if (cfgFileStat) {
        console.log("Found config.json, reading the environment...")
        const readJson = require(cfgPath) || {};
        const config = getJsonConfig(readJson);
        if (config) return config;
    } else {
        console.log("No suitable config.json, reading the environment...")
    }
    const config = getEnvConfig();

    if (!config) throw new Error(`Could not get any of the configs: ${NODE_ENV}`)
    if (!config.sql) throw new Error(`Could not get sql config: ${NODE_ENV}`)
    if (!config.discord_token) throw new Error(`Could not get discord config: ${NODE_ENV}`)
    return config;
}

const config = readConfig();
const { sql, discord_token } = config;
export default config;
export { sql, discord_token };

export type Configuration = {
    readonly sql: {
        readonly database: string;
        readonly username: string;
        readonly password?: string;
        readonly host: string;
        readonly dialect: "mysql" | "postgres" | "sqlite";
        readonly port: number;
        readonly url: string
        readonly other?: {
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