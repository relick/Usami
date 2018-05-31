# Usami
This is a bot that does a few bits and pieces for personal use but you can use it too if you want.
It's structured so that the configuration file defines the available commands (and available replies to things people say), and only works in servers that have been whitelisted by an admin.

Also, in `Legacy Lua Bot` there's a bot written in C++ that runs lua stuff. It runs on an old version of SleepyDiscord so don't expect to be able to get it working, but the code is there for the sake of being able to read it.

## Available Commands
Usami will read the `commands` field in `config.json` and then search for `.js` modules with the same name as the commands. It should be fairly easy to add your own command by looking at the `module.exports` from `schedule.js`.
The ones I've implemented are as follows:
### ~stats
Rolls ability scores for 5e Dungeons & Dragons using the 4d6kh3 formula.

### ~schedule [number of players expected for team 1] [backup team]
This is a pretty specific personal thing, it organises a D&D game for my group by pinging those involved and deciding which campaign we'll be playing, and on which day, based on who can turn up.
You probably won't find any use for this, just remove it from your `commands` field.

### ~remind {time period} {what to be reminded of}
Pretty simple. Ask for something to be reminded in minutes, hours, days, weeks, months, or years.

## Admin Commands
To use any of these you need to have your id in the `admins` field of `config.json`.
### ~addserver
Whitelists the server the command is used in.
### ~removeserver
Blacklists the server the command is used in.
### ~reload [config|data]
Reloads `config.json` and `data.json`, or only one or the other if a parameter is specified.
### ~save [config|data]
Saves `config.json` and `data.json`, or only one or the other if a parameter is specified.

## Setup
To use, make a file called `config.json` in the same directory as `main.js` that looks like this:
```json
{
    "token": "your token here",
    "prefixes": "~",
    "admins": [
        "your user ID here"
    ],
    "servers": [],
    "commands": [
        "help",
        "schedule",
        "stats",
        "remind"
    ],
    "replies": [
        {
            "trigger": "boop",
            "reply": "boop",
            "atStartOnly": true,
            "requireSpace": false,
            "caseSensitive": true
        },
        {
            "trigger": "/hug",
            "reply": "༼ つ ◕_◕ ༽つ",
            "atStartOnly": false,
            "requireSpace": false,
            "caseSensitive": false
        },
        {
            "trigger": "bot",
            "reply": "been here all along :eyes:",
            "atStartOnly": false,
            "requireSpace": true,
            "caseSensitive": false
        }
    ]
}
```

For the reply stuff, you need to have all 5 fields as demonstrated above. `requireSpace` means there must be spaces surrounding the trigger (or it's at the start or end) in order for it to work. The other booleans should be self-explantory.

You also need to make a file called `data.json` that looks like this:
```json
{}
```

Then just run with `node main.js`.

## Dependencies
- discord.js (`npm install discord.js`)