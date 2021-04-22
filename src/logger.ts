import approot from 'app-root-path'
import path from 'path';

import config from './config'
import winston, { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file';
import { MiddlewareFunction } from './Bot/MiddlewareManager';
const { combine, timestamp, printf, colorize, uncolorize } = format;

const ignorePrivate = format((info, opts) => {
    //Not logging private things in file
    if (info.private) { return false; }
    return info;
});


const squeezeObject = format((info, options) => {
    //In case message is an object, stringify it
    if (typeof info.message == 'object') {
        info.message = JSON.stringify(info.message)
    }
    return info;
})


const myFormat = printf(({ level, message, label, timestamp }) => {
    const _label = `${label}`.padStart(7);
    const _level = `${level}`.padStart(15)
    return `${timestamp} | ${_level} [${_label}]: ${message}`
})

const logger: any = createLogger({
    transports: [
        //console logger with colors
        new transports.Console({
            format: combine(
                squeezeObject(),
                timestamp({
                    format: "YYYY-MM-DD HH:mm:ss.SSS"
                }),
                format.colorize({
                    colors: {
                        info: 'blue',
                        debug: 'green'
                    }
                }),
                myFormat,
            ),
            handleExceptions: true,
            level: (config.logger?.consoleLevel || 'info')

        }),
        new transports.File({
            format: combine(ignorePrivate(), timestamp({
                format: "DD-MM HH:mm:ss.SSS"
            }), uncolorize({ raw: true }),
                format.prettyPrint()),
            dirname: "logs/",
            filename: "error.log",
            handleExceptions: true,
            level: 'error',
        }),
        new DailyRotateFile({
            format: combine(ignorePrivate(), timestamp({
                format: "DD-MM HH:mm:ss.SSS"
            }), uncolorize({ raw: true }), format.json()),
            filename: "bot-%DATE%.log",
            frequency: '4h',
            level: 'info',
            maxSize: 5242880,
            zippedArchive: true,
            handleExceptions: true,
            dirname: 'logs/',
            datePattern: 'YYYY-MM-DD',
        }),
    ],
    exitOnError: false
});
/* 
const levels = ['debug', 'info', 'error', 'warn']
levels.forEach((level) => {
    logger[level] = (msg: any, ...remains: any) => {
        if (typeof msg != "string") {
            return logger.log(level, '', msg, ...remains)
        }

        logger.log(level, msg, ...remains)
    }
}) */

export function getLogger(n: string): BotLogger {
    let label = path.basename(n) || n;
    if (label === "index.ts") {
        label = path.dirname(n).split(/[\\\/]/).pop() || n;
    }
    const c: any = logger.child(
        { label }
    );
    (<BotLogger>c).logMiddleware = (msg, client, res, next) => {
        const content = msg.content.replace(/[\n\t]+/g, ' ');
        const msgLink = msg.guild ? `https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}` : "DM";
        const uid = `${msg.author.id}`
        c.debug(`${content} -- ${msgLink} -- UID:${uid}`);
        next();
    }
    return <BotLogger>c;
}

(<BotLogger>logger).logMiddleware = (msg, client, res, next) => {
    const content = msg.content.replace(/[\n\t]+/g, ' ');
    const msgLink = msg.guild ? `https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}` : "DM";
    const uid = `${msg.author.id}`
    logger.debug(`[onMessage] ${content} -- ${msgLink} -- UID:${uid}`);
    next();
}

export default <BotLogger> logger;


interface BotLogger extends winston.Logger {
    logMiddleware: MiddlewareFunction
}