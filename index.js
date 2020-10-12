"use strict";
exports.__esModule = true;
var Bot_1 = require("./Bot");
var messageControls_1 = require("./Bot/messageControls");
var middleware_1 = require("./middleware");
var NODE_ENV = process.env.NODE_ENV;
var _a = require('./config/config.json'), _b = NODE_ENV, _c = _a[_b], config = _c === void 0 ? {} : _c;
var bot = new Bot_1["default"](config);
bot.onReady(function () {
    console.info("Logged in as " + bot.user.tag + "!");
    console.info("Url invite: " + bot.createInvite());
});
/*
bot.onReady(() => {
    setInterval(
        (client, channelId) => {
            client.channels
                .fetch(channelId)
                .then((channel) => {
                    return channel.send('!clean');
                })
                .then((message) => {
                    console.log(client);
                    return message.delete();
                })
                .then(() => {})
                .catch(console.error);
        },
        5 * 1000,
        bot.client,
        '494617599859228683',
    );
    //695356911427780690
    //358966701548765185
}); */
bot.register('greet', middleware_1.randomChance(0.5), function (msg, client) {
    console.log('PARAMS', client);
    msg.reply('Hi!');
});
//358966701548765185
bot.register('em', messageControls_1.selfDeleteMW, function (msg, client, params) {
    msg.awaitReactions(function () { return 1; }, { max: 1, time: 30000 }).then(function (collected) {
        console.log('COLLECTED:', collected);
    });
    Bot_1.msgCtrl(msg, client, {
        '💪': function (msg, client, par) {
            msg.reply('Reacted with :muscle:');
        },
        '❤': function (msg, client, par) {
            msg.reply(' I love you too!').then(function (message) {
                return message["delete"]({ timeout: 5000 });
            }).then(function () { return msg["delete"](); });
        }
    });
});
bot.registerDirectory('./commands', { skipErrors: false }, middleware_1.onlyNot({ guild: '494617599322095637' }, { isDev: process.env.ONLY_DEBUG }));
bot.registerDirectory('./commands-dev', { skipErrors: true }, middleware_1.onlyIf(function () { return process.env.ONLY_DEBUG; }), middleware_1.onlyIn({ channel: '494617599859228683' }));
bot.start(config.discord_token);
