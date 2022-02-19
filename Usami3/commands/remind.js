const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("remind")
		.setDescription("Add a reminder.")
		.addStringOption(option =>
			option.setName("delay")
				.setDescription("The time until you are reminded.")
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("message")
				.setDescription("The reminder message.")
				.setRequired(true)
		)
	,
	async execute(interaction, data, config, makeEmb) {
		let remid = interaction.user.id + Date.now().toString();

		const timeStr = interaction.options.getString("delay");
		const timeParams = timeStr.split(' ');
		if (timeParams.length < 2) {
			interaction.reply(`parse failed. \`${timeParams[0]}\` needs to specify a time period.`)
			return;
		}

		let n = parseInt(timeParams[0]);
		if (isNaN(n)) {
			if (timeParams[0] === "next") {
				n = 1;
			} else {
				interaction.reply(`parse failed. \`${timeParams[0]}\` is not a number.`);
				return;
			}
		} else if (n < 1) {
			interaction.reply(`parse failed. \`${timeParams[0]}\` needs to be greater than 0.`);
			return;
		}
		let d = new Date();
		if (timeParams[1].search(/min/g) > -1) {
			d.setMinutes(d.getMinutes() + n);
		} else if (timeParams[1].search(/hour/g) > -1) {
			d.setHours(d.getHours() + n);
		} else if (timeParams[1].search(/day/g) > -1) {
			d.setDate(d.getDate() + n);
		} else if (timeParams[1].search(/week/g) > -1) {
			d.setDate(d.getDate() + n * 7);
		} else if (timeParams[1].search(/month/g) > -1) {
			if (d.getDate() < 29) {
				d.setMonth(d.getMonth() + n);
			} else {
				//if we're at the end of the month now, make it end of the month next time
				d.setMonth(d.getMonth() + n);
				if (d.getDate() < 4) {
					d.setDate(1 - d.getDate());
				}
			}
		} else if (timeParams[1].search(/year?/g) > -1) {
			d.setFullYear(d.getFullYear() + n);
		} else {
			interaction.reply(`parse failed. \`${timeParams[1]}\` is not a valid timeframe.`);
			return;
		}

		if (data.reminders === undefined) {
			data.reminders = {};
		}
		data.reminders[remid] = {};
		data.reminders[remid].date = d;
		data.reminders[remid].channel = interaction.channel.id;
		data.reminders[remid].uid = interaction.user.id;
		data.reminders[remid].text = interaction.options.getString("message");

		interaction.reply(`I have set a reminder for ${n} ${timeParams[1]} from now.`);
	},

	repeat(client, data, config) {
		for (let c in data.reminders) {
			if (new Date(data.reminders[c].date) < new Date()) {
				client.channels.cache.get(data.reminders[c].channel).send(`<@${data.reminders[c].uid}>! ${data.reminders[c].text}`);
				delete data.reminders[c];
			}
		}
	},
};
