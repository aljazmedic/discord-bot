const Discord = require('discord.js');

const bot = new Discord.Client();

if(process.env.NODE_ENV == 'development'){
    require('dotenv').config();
}

const {DISCORD_TOKEN} = process.env;

bot.on('message', (message)=>{
    console.log(message)
})

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
  });

bot.login(DISCORD_TOKEN);