import Command, { CommandMessage, CommandResponse } from '../Bot/Command';
import { Client, Emoji, Message, MessageEmbed } from 'discord.js';
import Bot from '../Bot';
import cheerio from 'cheerio'
import axios from 'axios';
import { getLogger } from '../logger'
const logger = getLogger(__filename);

export default class Qran extends Command {
    constructor() {
        super('Qran');
        this.alias('bible', 'amen', 'allah', 'koran')
        this.description = "Selam alejkum (ٱلسَّلَامُ عَلَيْكُمْ)"
    }


    run(msg: CommandMessage, client: Bot, res: CommandResponse) {
        const [e, v] = getQranVerse();
        v.then((s) => res.channelReply(s).then(msg => msg.react(e)))
    }
}

const getQranVerse = (): [string, Promise<string>] => {
    const ayah = Math.floor(Math.random() * 6236) + 1;
    return ['✡',
        axios({
            url: `https://api.alquran.cloud/ayah/${ayah}/en.asad`,
            method: 'get',
        })
            .then((resp) => resp.data.data.text)]
}
/* //TODO
const getBibleVerse = (): [string, Promise<string>] => {
    "https://dailyverses.net/random-bible-verse"
} */