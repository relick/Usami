function validServer(interaction, config) {
	return interaction.guild.available && config.servers.includes(interaction.guild.id);
}

module.exports = {
	name: 'message',
	async execute(data, config, msg) {

		for (const macro of config.macros) {
			if (macro.trigger) {
				let con = msg.content;
				let trig = macro.trigger;
				if (!macro.caseSensitive) {
					con = con.toLowerCase();
				}
				if (macro.requireSpace) {
					trig = trig + ' ';
				}
				if (con.startsWith(trig) || con === macro.trigger) {
					msg.channel.send(macro.reply);
					continue;
				}
				if (!macro.atStartOnly) {
					if (macro.requireSpace) {
						if (con.endsWith(' ' + macro.trigger) || con.search(' ' + trig) > -1) {
							msg.channel.send(macro.reply);
							continue;
						}
					} else {
						if (con.search(trig) > -1) {
							msg.channel.send(macro.reply);
							continue;
						}
					}
				}
			}
			//bottom of loop
		}
		
	},
};