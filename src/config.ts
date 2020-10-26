const NODE_ENV = <string>process.env.NODE_ENV || 'production';
const config: Configuration = require('../config/config.json')[NODE_ENV] || {};


if (!config) throw new Error(`No such conifg: ${NODE_ENV}`)

const { sql, discord_token } = config;
export default config;
export { sql, discord_token };

export type Configuration = {
    readonly sql: {
        database: string;
        username: string;
        password?: string;
        host: string;
        dialect: 'mysql' | 'sqlite'
    },
    readonly discord_token: string;
    readonly prefix: string;
    readonly urban_token: string;
    readonly logger:{
        readonly consoleLevel:string
    }
}