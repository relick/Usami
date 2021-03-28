const REACT_LIST = [
    '✅', // can do
    '❌', // cannot do
    '🤷‍♀️' // can do but don't prefer
];

const REACT_OPTIONS = REACT_LIST.reduce((m, r, i) => m[r] = i, {});

let s_waitingOnReactionRemoval = 0

function startup(client, data) {
    if(data.schedule !== undefined) {
        client.channels.cache.get(data.schedule.scheduleChannelID).messages.fetch(data.schedule.saturday.messageID).then(msg => data.schedule.saturday.message = msg).catch(console.error);
        client.channels.cache.get(data.schedule.scheduleChannelID).messages.fetch(data.schedule.sunday.messageID).then(msg => data.schedule.sunday.message = msg).catch(console.error);
    }
}

function replacer(key, value) {
    // don't save the messages, we can't stringify them
    if (key === "message") {
      return undefined;
    }
    return value;
}

function addReactions(message, i = 0)
{
    if(i < REACT_LIST.length)
    {
        message.react(REACT_LIST[i]).then(msgrct => addReactions(msgrct.message, i + 1)).catch(console.error);
    }
}

function getDayFromMessageID(data, message)
{
    return (message.id === data.schedule.saturday.messageID)
    ? data.schedule.saturday
    : (message.id === data.schedule.sunday.messageID)
        ? data.schedule.sunday
        : null;
}

function createSelectionsLists()
{
    let selections = {};
    for(let react in REACT_OPTIONS)
    {
        selections[react] = [];
    }
    return selections;
}

function startScheduler(msg, params, data, makeEmb) {
    if(data.schedule === undefined) {
        data.schedule = {};
    }
    data.schedule.active = true;
    data.schedule.saturday = { selections:createSelectionsLists() };
    data.schedule.sunday = { selections:createSelectionsLists() };

    // set a reminder schedule for midday friday
    let remindDate = new Date();
    if(remindDate.getDay() == 6)
    {
        remindDate.setDate(remindDate.getDate() + 6);
    }
    else
    {
        remindDate.setDate(remindDate.getDate() + (5 - remindDate.getDay()));
    }
    remindDate.setHours(12, 0, 0);
    data.schedule.remindDate = remindDate;

    data.schedule.scheduleChannelID = msg.channel.id;

    msg.channel.send(`@everyone | ${msg.author.username} wants to schedule a D&D game.`).then(message => message.pin()).catch(console.error);
    msg.channel.send("Please specify preference for Saturday.").then(message => {
        data.schedule.saturday.message = message;
        data.schedule.saturday.messageID = message.id;
        addReactions(message);
    }).catch(console.error);
    msg.channel.send("Please specify preference for Sunday.").then(message => {
        data.schedule.sunday.message = message;
        data.schedule.sunday.messageID = message.id;
        addReactions(message);
    }).catch(console.error);
}

function reactionAdded(msgrct, usr, data, makeEmb) {
    if(data.schedule !== undefined && data.schedule.active && !msgrct.me) {
        let message = msgrct.message;
        let day = getDayFromMessageID(data, message);
        const thisReact = msgrct.emoji.name;

        if(day !== null && REACT_OPTIONS[thisReact] !== undefined)
        {
            // check if user already selected another option and remove it if so
            for(let react in day.selections)
            {
                if(react != thisReact && day.selections[react].includes(usr.id))
                {
                    message.reactions.resolve(react).users.remove(usr);
                    s_waitingOnReactionRemoval += 1;
                }
            }

            // then add the new selection
            day.selections[thisReact].push(usr.id);
        }
    }
}

function reactionRemoved(msgrct, usr, data, makeEmb) {
    if(data.schedule !== undefined && data.schedule.active && !msgrct.me) {
        let day = getDayFromMessageID(data, msgrct.message);
        const thisReact = msgrct.emoji.name;

        if(day !== null && REACT_OPTIONS[thisReact] !== undefined)
        {
            // remove user from selection
            day.selections[thisReact].filter(id => id != usr.id);
            if(s_waitingOnReactionRemoval > 0)
            {
                s_waitingOnReactionRemoval -= 1;
            }
        }
    }
}

function repeat(client, data, config) {
    if(data.schedule !== undefined && data.schedule.active && s_waitingOnReactionRemoval === 0)
    {
        let s = data.schedule;
        if(!s.reminded && new Date(s.remindDate) < new Date()) {
            for(let user of config.scheduleUsers)
            {
                let userVotedSaturday = false;
                for(let reactList in s.saturday.selections)
                {
                    if(reactList.includes(user))
                    {
                        userVotedSaturday = true;
                        break;
                    }
                }

                let userVotedSunday = false;
                for(let reactList in s.sunday.selections)
                {
                    if(reactList.includes(user))
                    {
                        userVotedSunday = true;
                        break;
                    }
                }
                
                if(!userVotedSaturday || !userVotedSunday)
                {
                    client.channels.cache.get(s.scheduleChannelID).send(`<@${user}>! This is a reminder that you need to mark when you are free for D&D :junnapray:.`);
                }
            }
            s.reminded = true;
        }

        const numPlayers = config.scheduleUsers.length;
        const saturdayTotal = s.saturday.selections.reduce((total, userList) => total += userList.length, 0);
        const sundayTotal = s.sunday.selections.reduce((total, userList) => total += userList.length, 0);

        if(saturdayTotal >= numPlayers && sundayTotal >= numPlayers)
        {
            const sundayFullSupportNum = s.sunday.selections['✅'].length;
            const saturdayFullSupportNum = s.saturday.selections['✅'].length;
            const sundayHasEnoughSupport = (sundayFullSupport + s.sunday.selections['🤷‍♀️'].length) === numPlayers;
            const saturdayHasEnoughSupport = (saturdayFullSupport + s.saturday.selections['🤷‍♀️'].length) === numPlayers;

            let str = "@everyone | Not enough players for a session :frowning:.";
            if(sundayFullSupportNum === numPlayers)
            {
                str = "@everyone | We will play Sunday 12pm (unanimous).";
            }
            else if(saturdayFullSupportNum === numPlayers)
            {
                str = "@everyone | We will play Saturday 12pm (unanimous).";
            }
            else if(sundayHasEnoughSupport || saturdayHasEnoughSupport)
            {
                if(!saturdayHasEnoughSupport || (sundayHasEnoughSupport && sundayFullSupportNum >= saturdayFullSupportNum))
                {
                    str = "@everyone | We will play Sunday 12pm (by preference).";
                }
                else
                {
                    str = "@everyone | We will play Saturday 12pm (by preference).";
                }
            }
            message.channel.send(str).then(message => message.pin()).catch(console.error);
            s.active = false;
        }
    }
}

module.exports = {ready: startup, replacer: replacer, message: startScheduler, messageReactionAdd: reactionAdded, messageReactionRemove: reactionRemoved, repeat: repeat};