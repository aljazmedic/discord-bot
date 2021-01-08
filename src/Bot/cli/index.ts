import { DMChannel, Guild, Message, MessageEmbed, User } from "discord.js";
import Bot from "..";
import { getLogger } from "../../logger";
import workon from './workon'
import ls from './ls'

const logger = getLogger("cli")
export const MEDIC_ID = "205802315393925120"

export default class CliInterface {
    bot: Bot;
    user: User | null;
    workonGuild: Guild | null;
    listening: boolean;
    commands: { [key: string]: (cli: CliInterface, bot: Bot, args: string[]) => string | Promise<string> };

    constructor(bot: Bot) {
        this.bot = bot;
        this.user = null;
        this.listening = true;
        this.workonGuild = null;
        this.commands = {
            workon,
            ls
        }
    }

    getUser() {
        if (this.user) return Promise.resolve(this.user);
        return this.bot.users.fetch(MEDIC_ID)
    }

    getDMChannel() {
        if (this.user && this.user.dmChannel) {
            return Promise.resolve(this.user.dmChannel);
        }
        else if (this.user) {
            return this.user.createDM()
        }
        else {
            return this.bot.users.fetch(MEDIC_ID).then(u => {
                this.user = u;
                return this.user.createDM();
            })
        }

    }

    send(command: string, text: string | MessageEmbed) {
        const formatted = `\`\`\`\n> (${this.workonGuild ? this.workonGuild.name : "none"}) \$ ${command}\n${text}\`\`\``
        return this.getDMChannel().then(dms =>
            dms.send(formatted)
        )
    }

    handleCommand(cntnt: string) {
        const parts = cntnt.trim().split(" ")
        if (parts.length == 0) {
            return Promise.reject(new Error("Empty command!"))
        };
        const command = parts.shift()!.toLowerCase()
        if (command == undefined) {
            return this.send(cntnt, `Cannot retrieve command from \`${cntnt}\``);
        }
        if (command.startsWith("/listen")) {
            this.listening = !this.listening;
            return this.send(cntnt, `Listening: \`${this.listening ? "on" : "off"} \``);
        } else if (command.startsWith("/on")) {
            this.listening = true;
            return this.send(cntnt, `Listening: \`${this.listening ? "on" : "off"} \``);
        }

        const fn = this.commands[command];
        if (!fn) {
            const e = new Error("Invalid command");
            this.send(cntnt, e.toString());
            return Promise.reject(e);
        }
        const resp = fn(this, this.bot, parts)

        if (resp instanceof Promise) {
            return resp.then(s =>
                this.send(cntnt, s)
            )
        } else {
            return this.send(cntnt, resp);
        }
    }

    messageHandler(msg: Message) {
        if (msg.author.id != MEDIC_ID || msg.channel.type != "dm") return;
        const cntnt = msg.content.trim();
        const commands = cntnt.split(";")
        if (!this.listening) return;
        commands.filter(c => c.length > 0).reduce<Promise<any | undefined>>((p, current) => {
            return p.then(() => this.handleCommand(current)).catch(e => { logger.error(e);return Promise.reject() })
        }, Promise.resolve())
    }
}
