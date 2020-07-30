const Bot = require("./Bot");
const {
  parseIdsToObjects,
  parseNumbers,
  randomChance,
} = require("./Bot/middlewares");
if (process.env.NODE_ENV == "development") {
  require("dotenv").config();
}

const { DISCORD_TOKEN } = process.env;

const bot = new Bot("?");

bot.onReady(() => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.use(randomChance(0.5), (msg, client, params, next) => {
  console.log("RANDOMMM");
  next();
});

bot.register("greet", (msg, client, params) => {
  console.log("PARAMS", params);
  msg.reply("Hi!");
});

bot.registerDirectory("./commands");

bot.start(DISCORD_TOKEN);
