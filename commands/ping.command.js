const Ping = (msg, client, params) => {
    msg.reply("pong")
}

Ping.name = "ping"

Ping.before = [] // middleware

module.exports = Ping