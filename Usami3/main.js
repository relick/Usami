const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });
client.userData = { config: require("./config.json"), data: require("./data.json") };
client.userData.data.lastsave = 0;

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.macros = new Discord.Collection();
for (const macro of client.userData.config.macros) {
	client.macros.set(macro.trigger, macro);
}

const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(client.userData.data, client.userData.config, ...args));
	} else {
		client.on(event.name, (...args) => event.execute(client.userData.data, client.userData.config, ...args));
	}
}

client.login(client.userData.config.token);

function repeat() {
	client.commands.forEach((c) => {
		if (c.repeat !== undefined) {
			c.repeat(client, client.userData.data, client.userData.config);
		}
	});
}

setInterval(repeat, 60000);