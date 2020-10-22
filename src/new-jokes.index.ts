import { JokeDB, JokeReplyDB, JokeTypeDB } from "./Bot/models";
import axios from 'axios'
import cheerio from 'cheerio'


const prebuildRegex = (regexModel: string, rplaceStr:string) => {
    return regexModel.replace(/%\w+%/ig, (all: string) => {
        const toInsert = rplaceStr;
        return toInsert.replace(/([aeiou])/g, (m) => `${m}?`)
    });
}

const REGEX_MODEL = {
    "WH": "(idk ?)?((%txt%( (is it)|( ('| i)s there)?))|(\\?*))\\??",
    "KK_REPLY": "%txt% ?w?ho\\?*"
}

const REGEX = {
    "WHO": new RegExp(prebuildRegex(REGEX_MODEL.WH, "who")),
}

axios({
    "url": "https://official-joke-api.appspot.com/random_joke",
    "method": "get"
}).then(async (response) => {
    const { id, setup, punchline, type }: { id: number, setup: string, type: string, punchline: string } = response.data;
    let jType = undefined;
    if (setup.startsWith("What do you call ")) {
        jType = await JokeTypeDB.findOne({ where: { type: "WDYC" } });
        const firstSetup = setup.split("What do you call ")[1];
        await JokeDB.create({
            JokeTypeDB: jType,
            replies: [
                {
                    replyText: firstSetup,
                    position: 1,
                    triggerRegex: null // include with type printout
                },
                {
                    replyText: punchline,
                    position: 2,
                    triggerRegex: prebuildRegex(REGEX_MODEL.WH, "what")
                }
            ]
        }, { include: [JokeTypeDB, JokeReplyDB] });
    } else {
        jType = undefined;
        return;
    }
})