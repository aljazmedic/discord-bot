const discord = require("discord.js");

function getUserFromMention(client, mention) {
  const matches = mention.match(/^<@!?(\d+)>$/);
  if (!matches) return;

  const id = matches[1];
    console.log("id", id);
  return client.users.cache.get(id);
}

const parseMentions = (msg, client, params, next) => {
  params.mentions = {};
  const args = params.args || [];
  args.forEach((arg, idx) => {
    const u = getUserFromMention(client, arg);
    console.log(u);
    if (u) params.mention[idx] = u;
  });
  next();
};

const parseNumbers = (msg, client, params, next) => {
  params.args = params.args.map((part, idx) => {
    return isNaN(part) ? part : parseFloat(part);
  });
  next();
};
module.exports = { parseMentions, parseNumbers };
