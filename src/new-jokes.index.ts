import { JokeDB, JokeReplyDB, JokeTypeDB } from "./Bot/models";
import axios from 'axios'
import cheerio from 'cheerio'


const prebuildRegex = (regexModel: string, rplaceStr: string) => {
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

const whRegex = new RegExp("^(?:Who|What|When|Where|Why|Which|Whom|Whose|How)", 'i');

axios({
    "url": "https://official-joke-api.appspot.com/random_joke",
    "method": "get"
}).then(async (response) => {
    const { id, setup, punchline, type }: { id: number, setup: string, type: string, punchline: string } = response.data;

    console.table({ id, setup, punchline, type });
    let jType: JokeTypeDB;
    let replies = [];

    const whMatch = setup.match(whRegex);
    if (whMatch) {
        console.log();
        jType = <JokeTypeDB>await JokeTypeDB.findOne({ where: { type: "WH" } });
        replies = [
            {
                replyText: setup,
                position: 1,
                triggerRegex: null // include with type printout
            },
            {
                replyText: punchline,
                position: 2,
                triggerRegex: prebuildRegex(REGEX_MODEL.WH, whMatch[0])
            }
        ]
        JokeDB.create({
            api_id: id,
            jtype_id:jType.id,
            replies,

        }, { include: [JokeReplyDB] }) 
    } else {
        return;
    }
})