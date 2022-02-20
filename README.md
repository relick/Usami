# Usami
This is a bot that does a few bits and pieces for personal use but you can use it too if you want.
It's structured so that the configuration file defines the available commands (and available replies to things people say), and only works in servers that have been whitelisted by an admin.

Also, in `Legacy Lua Bot` there's a bot written in C++ that runs lua stuff. It runs on an old version of SleepyDiscord so don't expect to be able to get it working, but the code is there for the sake of it

## Available Commands
Usami will search for `.js` modules in the commands folder.
The ones I've implemented are as follows:
### /stats
Rolls ability scores for 5e Dungeons & Dragons using the 4d6kh3 formula.

### /xp add
Adds XP to a global count.

### /xp show
Shows the global XP count.

### /remind {time period} {what to be reminded of}
Pretty simple. Ask for something to be reminded in minutes, hours, days, weeks, months, or years.

## Admin Commands
To use any of these you need to have your id in the `admins` field of `config.json`.
### /admin server add
Whitelists the server the command is used in.
### /admin server remove
Blacklists the server the command is used in.
### /admin reload
Reloads `data.json`.
### /admin save
Saves `config.json` and `data.json`.

## Setup
To use, make a file called `config.json` in the same directory as `main.js` that looks like this:
```json
{
    "token": "your token here",
    "admins": [
        "your user ID here"
    ],
    "servers": [],
    "macros": [
        {
            "name": "boop",
            "trigger": "boop",
            "reply": "boop",
            "atStartOnly": true,
            "requireSpace": false,
            "caseSensitive": true
        },
        {
            "name": "hug",
            "trigger": "/hug",
            "reply": "༼ つ ◕_◕ ༽つ",
            "atStartOnly": false,
            "requireSpace": false,
            "caseSensitive": false
        },
        {
            "name": "bot",
            "trigger": "bot",
            "reply": "been here all along :eyes:",
            "atStartOnly": false,
            "requireSpace": true,
            "caseSensitive": false
        }
    ]
}
```

For the macro stuff, you need to have all 6 fields as demonstrated above. `requireSpace` means there must be spaces surrounding the trigger (or it's at the start or end) in order for it to work. The other booleans should be self-explantory. The name field is used for generating a slash command for the replies.

You also need to make a file called `data.json` that looks like this:
```json
{}
```

Then just run with `node main`.

## Dependencies
- discord.js (`npm install discord.js`)