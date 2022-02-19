const { SlashCommandBuilder } = require("@discordjs/builders");

//inclusive both ends
let rollDice = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Roll a character stat set.")
		,
	async execute(interaction, data, config, makeEmb) {
		let em = makeEmb(interaction);
		let rolls = [];
		for (let stat_i = 0; stat_i < 6; stat_i++) {
			rolls.push(0);
			let min = 6;
			for (let roll_i = 0; roll_i < 4; roll_i++) {
				let r = rollDice(1, 6);
				if (min > r) {
					min = r;
				}
				rolls[stat_i] += r;
			}
			rolls[stat_i] -= min;
		}
		em.setAuthor({ name: "5e Stat Rolls", iconURL: interaction.author.avatarURL() });
		em.setDescription('`' + rolls.join(' ') + '`');

		interaction.reply({ embeds: [em] });
	},
};
