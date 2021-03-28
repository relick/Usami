const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();

function getConfig() {
    try {
        let conf = JSON.parse(fs.readFileSync("config.json", "utf8"));
        let com = {}
        conf.commands.forEach(c => {
            com[c] = require("./" + c);
            delete require.cache[require.resolve("./" + c)];
        });
        return [conf, com];
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

function saveConfig(conf) {
    try {
        fs.writeFileSync("config.json", JSON.stringify(conf, null, "    "), "utf8");
    } catch (error) {
        console.log(error);
        console.log(config);
        process.exit(1);
    }
}

function getData() {
    try {
        return JSON.parse(fs.readFileSync("data.json", "utf8"));
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

function replacer(key, value) {
    // Filtering out properties
    for(let c in commands) {
        if(commands[c].replacer !== undefined) {
            if(commands[c].replacer(key, value) === undefined) {
                return undefined;
            }
        }
    }
    return value;
  }

function saveData(dat) {
    try {
        fs.writeFileSync("data.json", JSON.stringify(dat, replacer, "    "), "utf8");
    } catch (error) {
        console.log(error);
        console.log(dat);
        process.exit(1);
    }
}

function readyDispatch() {
    for(let c in commands) {
        if(commands[c].ready !== undefined) {
            commands[c].ready(client, data);
        }
    }
}

client.on("ready", () => {
    readyDispatch();
    console.log(`Logged in as ${client.user.tag}!`);
});

function validServer(msg, conf) {
    return msg.guild.available && conf.servers.includes(msg.guild.id);
}

function validAdmin(msg, conf) {
    return conf.admins.includes(msg.author.id);
}

function checkPrefix(cont, conf) {
    for(let c of conf.prefixes) {
        if(cont.startsWith(c)) {
            return true;
        }
    }
    return false;
}

function makeEmb(msg) {
    return new Discord.MessageEmbed().setColor(0x34DB52).setAuthor(client.user.username, client.user.avatarURL());
}

function repeat() {
    data.lastsave += 1; //autosave every 10 minutes
    if(data.lastsave === 10) {
        data.lastsave = 0;
        saveConfig(config);
        saveData(data);
        //console.log("Config and data saved.");
    }
    for(let c in commands) {
        if(commands[c].repeat !== undefined) {
            commands[c].repeat(client, data, config);
        }
    }
}

client.on("message", msg => {
    if(checkPrefix(msg.content, config)) {
        let params = msg.content.slice(1).trim().split(/ +/g);
        if(params.length >= 0) {
            params[0] = params[0].toLowerCase();
            //special admin commands to be used on any server
            if(params[0] === "addserver" && validAdmin(msg, config)) {
                if(msg.guild.available && !config.servers.includes(msg.guild.id)) {
                    config.servers.push(msg.guild.id);
                    msg.reply("server whitelisted! Make sure to run `saveconfig`.");
                }
                return;
            }
            if(params[0] === "reload" && validAdmin(msg, config)) {
                if(params.length > 1) {
                    if(params[1] === "config") {
                        [config, commands] = getConfig();
                        msg.reply("config reloaded!");
                    } else if(params[1] === "data") {
                        data = getData();
                        msg.reply("data reloaded!");
                    }
                } else {
                    [config, commands] = getConfig();
                    data = getData();
                    msg.reply("config and data reloaded!");
                }
                readyDispatch();
                return;
            }
            if(params[0] === "save" && validAdmin(msg, config)) {
                if(params.length > 1) {
                    if(params[1] === "config") {
                        saveConfig(config);
                        msg.reply("config saved!");
                    } else if(params[1] === "data") {
                        saveData(data);
                        msg.reply("data saved!");
                    }
                } else {
                    saveConfig(config);
                    saveData(data);
                    msg.reply("config and data saved!");
                }
                return;
            }

            if(!validServer(msg, config)) {
                return;
            }
            //general commands
            if(commands[params[0]] !== undefined && commands[params[0]].message !== undefined) {
                commands[params[0]].message(msg, params, data, makeEmb);
            }

            if(!validAdmin(msg, config)) {
                return;
            }
            //not special admin commands

            //remove server from valid list
            if(params[0] === "removeserver") {
                if(msg.guild.available) {
                    config.servers = config.servers.filter(id => msg.guild.id !== id);
                    msg.reply("server blacklisted! Make sure to run `saveconfig`.");
                }
                return;
            }
                
        }
    } else if(msg.author.id !== client.user.id) {
        if(!validServer(msg, config)) {
            return;
        }
        for(let rep of config.replies) {
            let con = msg.content;
            let trig = rep.trigger;
            if(!rep.caseSensitive) {
                con = con.toLowerCase();
            }
            if(rep.requireSpace) {
                trig = trig + ' ';
            }
            if(con.startsWith(trig) || con === rep.trigger) {
                msg.channel.send(rep.reply);
                continue;
            }
            if(!rep.atStartOnly) {
                if(rep.requireSpace) {
                    if(con.endsWith(' ' + rep.trigger) || con.search(' ' + trig) > -1) {
                        msg.channel.send(rep.reply);
                        continue;
                    }
                } else {
                    if(con.search(trig) > -1) {
                        msg.channel.send(rep.reply);
                        continue;
                    }
                }
            }
            //bottom of loop
        }
    }
});

client.on("messageReactionAdd", (msgrct, usr) => {
    //necessary before discord.js fixes it
    if(usr.id === client.user.id) {
        msgrct.me = true;
    } else {
        msgrct.me = false;
    }
    for(let c in commands) {
        if(commands[c].messageReactionAdd !== undefined) {
            commands[c].messageReactionAdd(msgrct, usr, data, makeEmb);
        }
    }
});

client.on("messageReactionRemove", (msgrct, usr) => {
    //necessary before discord.js fixes it
    if(usr.id === client.user.id) {
        msgrct.me = true;
    } else {
        msgrct.me = false;
    }
    for(let c in commands) {
        if(commands[c].messageReactionRemove !== undefined) {
            commands[c].messageReactionRemove(msgrct, usr, data, makeEmb);
        }
    }
});

var config, commands;
[config, commands] = getConfig();
var data = getData();
data.prefix = config.prefixes[0];
data.lastsave = 0;

client.login(config.token);

setInterval(repeat, 60000);