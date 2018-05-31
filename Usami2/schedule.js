function startScheduler(msg, params, data, makeEmb) {
    if(data.schedule === undefined) {
        data.schedule = {};
    }
    data.schedule.active = true;
    if(params.length > 1) {
        data.schedule.numplayers = params[1];
    } else {
        data.schedule.numplayers = 6;
    }
    if(params.length > 2) {
        data.schedule.spareteam = params[2];
    } else {
        data.schedule.spareteam = 'N';
    }
    data.schedule.saturday = {y:[], n:[], u:[]}; //y=can do, n=cannot do, u=unknown, will be reminded later.
    data.schedule.sunday = {y:[], n:[], u:[]};

    msg.channel.send(`everyone | ${msg.author.username} wants to schedule a D&D game.`).then(message => message.pin()).catch(console.error);
    msg.channel.send("Please tick this if you can play on Saturday and cross it if you can't.").then(message => {
        data.schedule.msat = message;
        message.react('✅').then(msgrct => msgrct.message.react('❌')).catch(console.error);
    }).catch(console.error);
    msg.channel.send("Please tick this if you can play on Sunday and cross it if you can't.").then(message => {
        data.schedule.msun = message;
        message.react('✅').then(msgrct => msgrct.message.react('❌')).catch(console.error);
    }).catch(console.error);
}

function reactionAdded(msgrct, usr, data, makeEmb) {
    if(data.schedule !== undefined && data.schedule.active && !msgrct.me) {
        let transferred = false; //if user already clicked a different option
        if(msgrct.message.id === data.schedule.msat.id) {
            if(msgrct.emoji.name === '✅') {
                if(data.schedule.saturday.n.includes(usr.id)) {
                    console.log(data.schedule.msat.reactions);
                    data.schedule.msat.reactions.find(msgrct => msgrct.emoji.name === '❌').remove(usr);
                    transferred = true;
                }
                data.schedule.saturday.y.push(usr.id);
            } else if(msgrct.emoji.name === '❌') {
                if(data.schedule.saturday.y.includes(usr.id)) {
                    data.schedule.msat.reactions.find(msgrct => msgrct.emoji.name === '✅').remove(usr);
                    transferred = true;
                }
                data.schedule.saturday.n.push(usr.id);
            }
        } else if(msgrct.message.id === data.schedule.msun.id) {
            if(msgrct.emoji.name === '✅') {
                if(data.schedule.sunday.n.includes(usr.id)) {
                    data.schedule.msun.reactions.find(msgrct => msgrct.emoji.name === '❌').remove(usr);
                    transferred = true;
                }
                data.schedule.sunday.y.push(usr.id);
            } else if(msgrct.emoji.name === '❌') {
                if(data.schedule.sunday.y.includes(usr.id)) {
                    data.schedule.msun.reactions.find(msgrct => msgrct.emoji.name === '✅').remove(usr);
                    transferred = true;
                }
                data.schedule.sunday.n.push(usr.id);
            }
        }
        let s = data.schedule;
        let total = s.sunday.y.length + s.sunday.n.length + s.saturday.y.length + s.saturday.n.length;
        if(!transferred && total >= s.numplayers*2) {
            let str = "everyone | Not enough players for a game. :frowning:";
            if(s.sunday.y.length >= s.numplayers) {
                str = "everyone | Team 1, Sunday, 11am GMT.";
            } else if(s.saturday.y.length >= s.numplayers) {
                str = "everyone | Team 1, Saturday, 11am GMT.";
            } else if(s.sunday.y.length >= 4) {
                str = `everyone | Team ${s.spareteam}, Sunday, 11am GMT.`;
            } else if(s.saturday.y.length >= 4) {
                str = `everyone | Team ${s.spareteam}, Saturday, 11am GMT.`;
            }
            msgrct.message.channel.send(str).then(message => message.pin()).catch(console.error);
            data.schedule.active = false;
        }
    }
}

function reactionRemoved(msgrct, usr, data, makeEmb) {
    if(data.schedule !== undefined && data.schedule.active && !msgrct.me) {
        if(msgrct.message.id === data.schedule.msat.id) {
            if(msgrct.emoji === '✅') {
                data.schedule.saturday.y.filter(id => id != usr.id);
            } else if(msgrct.emoji === '❌') {
                data.schedule.saturday.n.filter(id => id != usr.id);
            }
        } else if(msgrct.message.id === data.schedule.msun.id) {
            if(msgrct.emoji === '✅') {
                data.schedule.sunday.y.filter(id => id != usr.id);
            } else if(msgrct.emoji === '❌') {
                data.schedule.sunday.n.filter(id => id != usr.id);
            }
        }
    }
}

module.exports = {message: startScheduler, messageReactionAdd: reactionAdded, messageReactionRemove: reactionRemoved};