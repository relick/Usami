const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Routes } = require('discord-api-types/v9');
const { clientID, servers, token, macros, } = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

for (const macro of macros) {
	commands.push(new SlashCommandBuilder().setName(macro.name).setDescription(macro.reply).toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

for (const guildID of servers) {
	rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commands })
		.then(() => console.log(`Successfully registered application commands in guild '${guildID}'.`))
		.catch(console.error);
}