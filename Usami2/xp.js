function xp(msg, params, data, makeEmb) {
    if(params.length < 2) {
        msg.reply("you need to specify a command.");
        return;
    }

    if(data.xp === undefined) {
        data.xp = { "currentXP": 14000 };
    }

    if(params[1] === "add") {
        if(params.length < 3) {
            msg.reply("you need to specify an amount.");
            return;
        }
        let n = parseInt(params[2]);
        if(isNaN(n)) {
            msg.reply(`parse failed. \`${params[2]}\` is not a number.`);
            return;
        }
        data.xp.currentXP += n;
    
        msg.reply(`New party XP level is ${data.xp.currentXP}!`);
    } else if(params[1] === "show") {
        msg.reply(`Current party XP level is ${data.xp.currentXP}!`);
    }
}

module.exports = {message: xp};