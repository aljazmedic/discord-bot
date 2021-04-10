import { OnlyDict } from "./middleware/filters";
import fs from 'fs'
import { resolve as resolveProjPath } from "app-root-path";

const { NODE_ENV = 'production' } = process.env;
if (NODE_ENV == "development") {
    require('dotenv').config();
    console.log("Parsing .env file")
}

function checkSqlURI(database_url: string): string {
    const re = RegExp(`\\w+://[\.\\w-]+:[\.\\w-]+@[\.\\w-]+(?:\:\\d+)?/[\.\\w-]+`);
    const m = database_url.match(re);
    if (!m) {
        throw Error("Invalid SQL resource string");
    }
    return database_url;
}

function getEnvSqlConfig() {
    const { DATABASE_URL } = process.env;
    return DATABASE_URL && checkSqlURI(DATABASE_URL);
}

function getEnvConfig() {
    const mandatory_keys = {
        //name in env : write to key
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

function getJsonConfig(jsonDict: any) {
    if (!(NODE_ENV in jsonDict)) return false;
    let envConfig = jsonDict[NODE_ENV];
    if (envConfig.sql == undefined) {
        throw new Error("No sql configuration!");
    }
    envConfig.sql = checkSqlURI(envConfig.sql);
    return envConfig;
}



function readConfig(): Configuration {
    const cfgPath = resolveProjPath('config/config.json');
    const cfgFileStat = fs.existsSync(cfgPath);
    if (cfgFileStat) {
        console.log("Found config.json, reading it...")
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
    readonly sql: string,
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