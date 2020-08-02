const Ping = (msg, client, params) => {
    //final function
    console.log(params);
    msg.reply('pong');
};

Ping.name = 'ping'; //name of the command

Ping.before = []; // middleware functions

Ping.aliases = ['testp'];

export default Ping;
