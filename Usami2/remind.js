function remind(msg, params, data, makeEmb) {
    let remid = msg.author.id + Date.now().toString();
    if(params.length < 3) {
        msg.reply("you need to specify a reminder time.");
        return;
    }
    if(params.length < 4) {
        msg.reply("you need to specify a reminder reason.");
        return;
    }
    let n = parseInt(params[1]);
    if(isNaN(n)) {
        if(params[1] === "next") {
            n = 1;
        } else {
            msg.reply(`parse failed. \`${params[1]}\` is not a number.`);
            return;
        }
    } else if(n < 1) {
        msg.reply(`parse failed. \`${params[1]}\` needs to be greater than 0.`);
        return;
    }
    let d = new Date();
    if(params[2].search(/minute[s]?/g) > -1) {
        d.setMinutes(d.getMinutes() + n);
    } else if(params[2].search(/hour[s]?/g) > -1) {
        d.setHours(d.getHours() + n);
    } else if(params[2].search(/day[s]?/g) > -1) {
        d.setDate(d.getDate() + n);
    } else if(params[2].search(/week[s]?/g) > -1) {
        d.setDate(d.getDate() + n*7);
    } else if(params[2].search(/month[s]?/g) > -1) {
        if(d.getDate() < 29) {
            d.setMonth(d.getMonth() + n);
        } else {
            //if we're at the end of the month now, make it end of the month next time
            d.setMonth(d.getMonth() + n);
            if(d.getDate() < 4) {
                d.setDate(1-d.getDate());
            }
        }
    } else if(params[2].search(/year[s]?/g) > -1) {
        d.setFullYear(d.getFullYear() + n);
    } else {
        msg.reply(`parse failed. \`${params[2]}\` is not a valid timeframe.`);
        return;
    }

    if(data.reminders === undefined) {
        data.reminders = {};
    }
    data.reminders[remid] = {};
    data.reminders[remid].date = d;
    data.reminders[remid].channel = msg.channel.id;
    data.reminders[remid].uid = msg.author.id;
    data.reminders[remid].text = params.slice(3).join(' ');

    msg.reply(`set a reminder for ${n} ${params[2]} from now.`);
}

function repeat(client, data) {
    for(let c in data.reminders) {
        if(new Date(data.reminders[c].date) < new Date()) {
            client.channels.get(data.reminders[c].channel).send(`<@${data.reminders[c].uid}>! ${data.reminders[c].text}`);
            delete data.reminders[c];
        }
    }
}

module.exports = {message: remind, repeat: repeat};