const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

function getData()
{
	try {
		return JSON.parse(fs.readFileSync("data.json", "utf8"));
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
}

function saveConfig(conf) {
	try {
		fs.writeFileSync("config.json", JSON.stringify(conf, null, "    "), "utf8");
	} catch (error) {
		console.log(error);
		console.log(conf);
		process.exit(1);
	}
}

function saveData(dat) {
	try {
		fs.writeFileSync("data.json", JSON.stringify(dat, null, "    "), "utf8");
	} catch (error) {
		console.log(error);
		console.log(dat);
		process.exit(1);
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("admin")
		.setDescription("Admin actions.")
		.addSubcommand(subcommand =>
			subcommand.setName("reload")
				.setDescription("Reload bot data.")
		)
		.addSubcommand(subcommand =>
			subcommand.setName("save")
				.setDescription("Save bot data and config.")
		)
		.addSubcommand(subcommand =>
			subcommand.setName("server")
				.setDescription("Change server config.")
				.addIntegerOption(option =>
					option.setName("action")
						.setDescription("Action to apply to the server.")
						.setRequired(true)
						.addChoice("add", 1)
						.addChoice("remove", 2)
				)
		)
	,
	adminOnly: true,
	anyServer: true,

	async execute(interaction, data, config, makeEmb)
	{
		if (interaction.options.getSubcommand() === "reload")
		{
			interaction.client.userData.data = getData();
			interaction.reply("Data reloaded!");
		}
		else if (interaction.options.getSubcommand() === "save")
		{
			saveConfig(config);
			saveData(data);
			interaction.reply("Config and data saved!");
		}
		else if (interaction.options.getSubcommand() === "server")
		{
			const action = interaction.options.getInteger("action");
			if (action === 1)
			{
				// add
				if (interaction.guild.available && !config.servers.includes(interaction.guild.id))
				{
					config.servers.push(interaction.guild.id);
					interaction.reply("Server whitelisted! Make sure to run `save`.");
				}
			}
			else if (action === 2)
			{
				// remove
				if (interaction.guild.available)
				{
					config.servers = config.servers.filter(id => interaction.guild.id !== id);
					interaction.reply("Server blacklisted! Make sure to run `save`.");
				}
			}
		}
	},

	repeat(client, data, config) {
		data.lastsave += 1; //autosave every 10 minutes
		if (data.lastsave === 10) {
			data.lastsave = 0;
			saveConfig(config);
			saveData(data);
			//console.log("Config and data saved.");
		}
	},
};
