const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();

function getConfig() {
    try {
        let conf = JSON.parse(fs.readFileSync("config.json", "utf8"));
        let com = {}
        conf.commands.forEach(c => com[c] = require("./" + c));
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
        console.log(conf);
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

function saveData(dat) {
    try {
        let oDat = dat;
        for(let c in commands) {
            if(commands[c].prepToSave !== undefined) {
                commands[c].prepToSave(oDat);
            }
        }
        fs.writeFileSync("data.json", JSON.stringify(oDat, null, "    "), "utf8");
    } catch (error) {
        console.log(error);
        console.log(conf);
        process.exit(1);
    }
}

client.on("ready", () => {
    for(let c in commands) {
        if(commands[c].ready !== undefined) {
            commands[c].ready(client, data);
        }
    }
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
    return new Discord.RichEmbed().setColor(0x34DB52).setAuthor(client.user.username, client.user.avatarURL);
}

client.on("message", msg => {
    let conL = msg.content.toLowerCase();
    if(checkPrefix(conL, config)) {
        let params = conL.slice(1).trim().split(/ +/g);
        if(params.length >= 0) {
            //special admin commands to be used on any server
            if(params[0] === "addserver" && validAdmin(msg, config)) {
                if(msg.guild.available && !config.servers.includes(msg.guild.id)) {
                    config.servers.push(msg.guild.id);
                    msg.reply("Server whitelisted! Make sure to run `saveconfig`.");
                }
                return;
            }
            if(params[0] === "reload" && validAdmin(msg, config)) {
                if(params.length > 1) {
                    if(params[1] === "config") {
                        [config, commands] = getConfig();
                        msg.reply("Config reloaded!");
                    } else if(params[1] === "data") {
                        data = getData();
                        msg.reply("Data reloaded!");
                    }
                } else {
                    [config, commands] = getConfig();
                    data = getData();
                    msg.reply("Config and data reloaded!");
                }
                return;
            }
            if(params[0] === "save" && validAdmin(msg, config)) {
                if(params.length > 1) {
                    if(params[1] === "config") {
                        saveConfig(config);
                        msg.reply("Config saved!");
                    } else if(params[1] === "data") {
                        saveData(data);
                        msg.reply("Data saved!");
                    }
                } else {
                    saveConfig(config);
                    saveData(data);
                    msg.reply("Config and data saved!");
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
                    msg.reply("Server blacklisted! Make sure to run `saveconfig`.");
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
            if(con.startsWith(rep.trigger)) {
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

client.login(config.token);