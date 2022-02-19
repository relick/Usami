const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("xp")
		.setDescription("Keep track of party XP.")
		.addSubcommand(subcommand =>
			subcommand.setName("add")
				.setDescription("Add XP to the party.")
				.addIntegerOption(option =>
					option.setName("value")
						.setDescription("The amount of XP to add.")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName("show")
				.setDescription("Show party XP.")
		)
	,
	async execute(interaction, data, config, makeEmb)
	{
		if (data.xp === undefined)
		{
			data.xp = { "currentXP": 14000 };
		}

		if (interaction.options.getSubcommand() === "add")
		{
			const value = interaction.options.getInteger("value");
			data.xp.currentXP += value;
			interaction.reply(`New party XP level is ${data.xp.currentXP}!`);
		}
		else if (interaction.options.getSubcommand() === "show")
		{
			interaction.reply(`Current party XP level is ${data.xp.currentXP}!`);
		}

	},
};
