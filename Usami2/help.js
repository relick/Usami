function reply(msg, params, data, makeEmb) {
    let em = makeEmb(msg);
    em.setDescription(`The bot has the following commands:
\`\`\`${data.prefix}schedule [number of players expected for team 1] [backup team]\`\`\`
Starts scheduling a D&D game. When used without extra parameters, it assumes 6 players are needed to play team 1, and the backup team is labelled team N.
A minimum of 3 players are needed to play any game.
All players must tick, cross, or ? a schedule post for Usami to schedule anything. Usami will set reminders for anyone who picks ? for a couple days before the weekend.
\`\`\`${data.prefix}stats\`\`\`
Rolls you a set of 4d6kh3 stats.
\`\`\`${data.prefix}remind {timeframe} {message}\`\`\`
Specify a time frame like this: "1 week" or "10 years". Then put a space and type your message, and the bot will remind you after the time frame has passed.`);
    msg.channel.send({embed:em});
}

module.exports = {message: reply};