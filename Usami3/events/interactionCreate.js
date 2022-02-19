function validServer(interaction, config) {
	return interaction.guild.available && config.servers.includes(interaction.guild.id);
}

function validAdmin(interaction, config) {
	return config.admins.includes(interaction.user.id);
}

function makeEmb(interaction) {
	return new Discord.MessageEmbed().setColor(0x34DB52).setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL() });
}

module.exports = {
	name: 'interactionCreate',
	async execute(data, config, interaction) {
		if (!interaction.isCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);
		if (command) {
			if (command.adminOnly) {
				if (!validAdmin(interaction, config)) {
					await interaction.reply({ content: 'You are not an admin user!', ephemeral: true });
					return;
				}
			}

			if (!command.anyServer && !validServer(interaction, config)) {
				await interaction.reply({ content: 'Not a registered server!', ephemeral: true });
				return;
			}

			try {
				await command.execute(interaction, data, config, makeEmb);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
			return;
		}

		const macro = interaction.client.macros.get(interaction.commandName);

		if (macro) {
			interaction.reply(macro.reply);
			return;
		}
	},
};