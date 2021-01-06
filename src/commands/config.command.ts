import { reject, resolve } from "bluebird";
import { Client, Message, Guild as dGuild, TextChannel, GuildCreateChannelOptions, Channel, Role, GuildMember, User, GuildEmoji } from "discord.js";
import { Model, UpsertOptions } from "sequelize/types";
import Bot, { msgCtrl } from "../Bot";
import Command, { Argument, CommandFunction, CommandMessage, CommandResponse } from "../Bot/Command";
import { GuildDB } from "../Bot/models";
import Guild from "../Bot/models/Guild.model";
import { getLogger } from '../logger';
import { onlyDev, parseIdsToObjects } from "../middleware";
const logger = getLogger(__filename);


const configKeys: ConfigKeyDict = {
    "role-assign-channel": {
        dbName: "role_cid",
        type: "channel"
    }
}

function formatConfigKeyName(key: ConfigKey, val: any) {
    switch (key.type) {
        case "channel":
            return `<#${val.toString()}>`
        case "role":
        case "member":
            return `<@${val.toString()}>`
        default: return `\`${val.toString()}\``;
    }
}

function resolveKeyValue(msg: CommandMessage, bot: Bot, key: ConfigKey, val: Argument): GuildMember | Role | Channel | null {
    logger.debug(val);
    const checkVal = (val as User | Role | Channel).id !== undefined ? (val as User | Role | Channel).id : val.toString();
    switch (key.type) {
        case "channel":
            const c = msg.channel.guild.channels.resolve(checkVal);
            return c;
        case "role":
            const r = msg.channel.guild.channels.resolve(checkVal);
            return r;
        case "member":
            const gm = msg.channel.guild.members.resolve(checkVal);
            return gm;
    }
}



export default class Config extends Command {
    constructor() {
        super("config");
        this.description = '';
        //name of the command
        //this.setName("ping", "testp");
        this.before(onlyDev,parseIdsToObjects)
    }

    run(msg: CommandMessage, bot: Bot, res: CommandResponse) {
        if (msg.args.length == 0) {
            return res.channelReply(`Usage: \`${bot.prefix}${this.name} <key> \`\nPossible keys: \`${Object.keys(configKeys).join('\`, \`')}\``)
        }
        const keyName = msg.args[0].toString();
        const val = (msg.args.length == 2) ? msg.args[1] : undefined;
        if (!(keyName in configKeys)) {
            return res.channelReply(`Invalid config key!\nPossible keys: \`${Object.keys(configKeys).join('\`, \`')}\``);
        }
        const configKey = configKeys[keyName];

        const { id, name } = <dGuild>msg.guild;
        Guild.findOne({
            where: { id },
        }).then(g => {
            if (g) return Promise.resolve(g);
            return Guild.create({ id, name })
        }).then((gld) => {
            logger.debug(gld);
            if (val == undefined) {
                //Print the property
                logger.debug(gld)
                const dataVal = gld.getDataValue(configKey.dbName)
                const d = resolveKeyValue(msg, bot, configKey, dataVal)
                if (d) {
                    //Value exists && is set up
                    return res.channelReply(`This guild has \`${keyName}\` set to ${d}`)
                } else {
                    //Value is set up
                    return Promise.resolve().then((): Promise<Guild> => {
                        if (!d) {
                            //Value has passed
                            return gld.update({
                                [configKey.dbName]: null
                            })
                        } else {
                            return Promise.resolve(gld);
                        }
                    })
                        .then(() => {
                            return res.channelReply(`This guild doesn't have \`${keyName}\` set up!`)
                        })
                }
            }

            //set the property
            const insrt = resolveKeyValue(msg, bot, configKey, val);
            if (insrt == null) {
                return res.channelReply("Invalid set value!");
            }

            return gld.update({
                [configKey.dbName]: insrt.id
            }).then((gld2) => {
                const dataVal2 = gld2.getDataValue(configKey.dbName)
                return res.channelReply(`This guild has changed \`${keyName}\` to ${formatConfigKeyName(configKey, dataVal2)}`)
            })
        })
    }
};

type ConfigKeyDict = {
    [key: string]: ConfigKey
}
export type ConfigKey = {
    dbName: keyof Guild,
    type: "channel" | "member" | "role"
}