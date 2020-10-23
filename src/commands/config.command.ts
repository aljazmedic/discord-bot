import { resolve } from "bluebird";
import { Client, Message, Guild, TextChannel, GuildCreateChannelOptions } from "discord.js";
import Command, { CommandFunction, CommandParameters } from "../Bot/Command";
import { GuildDB } from "../Bot/models";


type CreateControlChannelOptions = GuildCreateChannelOptions & {
    name: string
    db: string
};

function createControlChannel(guild: Guild, channelsOptions: CreateControlChannelOptions[]): Promise<(TextChannel | null)[]> {
    return new Promise((resolve, reject) => {
        channelsOptions.map((options) => {
            guild.channels.create(options.name, options).then((tChannel) => {
                return GuildDB.update({ [options.db]: tChannel.id }, { where: { id: guild.id } })
            }).then((v) => { })
        })
    });
}


export default class Config extends Command {
    constructor() {
        super();
        this.description = '';
        this.name = "config" //name of the command
        //this.setName("ping", "testp");
    }

    run(msg: Message, client: Client, params: CommandParameters) {
        //final function
        const { id, name }: { id: string, name: string } = <Guild>msg.guild;
        GuildDB.findOrCreate({
            where: {
                id,
                name
            },
        }).then(([result, wasCreated]): Promise<TextChannel> => {
            return new Promise((resolve, reject) => {
                if (result.role_cid) {
                    return client.channels.fetch(result.role_cid);
                } else {
                    return msg.guild?.channels.create("role assign", {
                        type: 'text', reason: "To auto-manage roles",
                    })
                }
            })
        }).then((channel) => GuildDB.update({ role_cid: channel.id }, { where: { id } }).then(([n, updated]) => {
            console.log(updated);
        })
        ).catch(err => { console.error(err) })
    }
};
