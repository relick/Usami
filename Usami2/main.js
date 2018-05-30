const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

fs.readFile('my-file.txt', 'utf8', function(err, data) {
    if (err) throw err;
    console.log(data);
});

client.login('token');