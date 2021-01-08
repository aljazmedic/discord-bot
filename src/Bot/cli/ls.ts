import CliInterface, { MEDIC_ID } from ".";
import Bot from "..";
import { table } from "./util";

export default function (cli: CliInterface, bot: Bot) {
    return cli.getUser().then(u => {
        if (!cli.workonGuild) {
            return "Error: Set up current guild"
        }
        return cli.workonGuild.fetch().then(g => {
            return table(g.channels.cache.map(channel => {
                const permChannel = channel.permissionsFor(u)
                console.log(permChannel)
                const permissionsStr = (permChannel?.bitfield || 0).toString(2);
                const { name, type } = channel;
                return [
                    permissionsStr,
                    type.padStart(8),
                    name
                ];
            }))
        })
    })
}
