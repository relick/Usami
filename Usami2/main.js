const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();

function getConfig() {
  try {
    return JSON.parse(fs.readFileSync('config.json', 'utf8'));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

function saveConfig(conf) {
  try {
    fs.writeFileSync('config.json', JSON.stringify(conf), 'utf8');
  } catch (error) {
    console.log(error);
    console.log(conf);
    process.exit(1);
  }
}

function getData() {
  try {
    return JSON.parse(fs.readFileSync('data.json', 'utf8'));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

function saveData(dat) {
  try {
    fs.writeFileSync('data.json', JSON.stringify(dat), 'utf8');
  } catch (error) {
    console.log(error);
    console.log(conf);
    process.exit(1);
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

function validServer(msg, conf) {
  return msg.guild.available && conf.servers.includes(msg.guild.id);
}

function validAdmin(msg, conf) {
  return conf.admins.includes(msg.author.id);
}

function checkPrefix(conL, conf) {
  for(let c of conf.prefixes) {
    if(conL.startsWith(c)) {
      return true;
    }
  }
  return false;
}

function makeEmb(msg) {
  return new Discord.RichEmbed({author: msg.author, color: 0x34DB52});
}

client.on('message', msg => {
  let conL = msg.content.toLowerCase();
  if(checkPrefix(conL, config)) {
    conL.slice(1); //remove prefix from future edits
    let params = conL.split(' ');
    if(params.length >= 0) {
      //add server to valid list
      if(param[0] === 'addserver') {
        if(validAdmin(msg, config) && msg.guild.available && !config.servers.includes(msg.guild.id)) {
          config.servers.push(msg.guild.id);
          msg.reply('Server whitelisted! Make sure to run `saveconfig`.');
        }
        return;
      }

      if(!validServer(msg, conf)) {
        return;
      }
      //general commands



      if(!validAdmin(msg, conf)) {
        return;
      }
      //admin commands

      if(param[0] === 'reloadconfig') {
        config = getConfig();
        msg.reply('Config reloaded!');
        return;
      }

      if(param[0] === 'saveconfig') {
        saveConfig(config);
        msg.reply('Config saved!');
        return;
      }

      //remove server from valid list
      if(param[0] === 'removeserver') {
        if(msg.guild.available) {
          config.servers = config.servers.filter(id => msg.guild.id !== id);
          msg.reply('Server blacklisted! Make sure to run `saveconfig`.');
        }
        return;
      }
        
    }
  } else if(msg.author.id !== client.user.id) {
    for(let rep of config.replies) {
      let con = message.content;
      let trig = rep.trigger;
      if(!rep.caseSensitive) {
        con = con.toLowerCase();
      }
      if(rep.requireSpace) {
        trig = trig.concat(' ');
      }
      if(con.startsWith(rep.trigger)) {
        msg.reply(rep.reply);
        continue;
      }
      if(!rep.atStartOnly) {
        if(rep.requireSpace) {
          if(con.endsWith(' '.concat(rep.trigger)) || con.search(' '.concat(trig)) > -1) {
            msg.reply(rep.reply);
            continue;
          }
        } else {
          if(con.search(trig) > -1) {
            msg.reply(rep.reply);
            continue;
          }
        }
      }
    }
  }
});

var config = getConfig();
var data = getData();

client.login(config.token);