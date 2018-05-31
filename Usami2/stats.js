//inclusive both ends
let rollDice = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let commands = {message: rollstats};

function rollstats(msg, params, data, makeEmb) {
    let em = makeEmb(msg);
    let rolls = [];
    for(let stat_i = 0; stat_i < 6; stat_i++) {
        rolls.push(0);
        let min = 6;
        for(let roll_i = 0; roll_i < 4; roll_i++) {
            let r = rollDice(1, 6);
            if(min > r) {
                min = r;
            }
            rolls[stat_i] += r;
        }
        rolls[stat_i] -= min;
    }
    let str = "`";
    rolls.forEach(r => str = str.concat(`${r} `));
    str = str.slice(0, -1).concat("`");
    em.setAuthor("5e Stat Rolls", msg.author.avatarURL);
    em.setDescription(str);
    msg.channel.send({embed:em});
}

module.exports = commands;