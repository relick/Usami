const { SlashCommandBuilder } = require("@discordjs/builders");
const chronify = require("./remind/chronify");
const friendlyFormat = require("./remind/friendly-format");

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
		const now = Date.now();
		let remid = interaction.user.id + now.toString();

		const timeStr = interaction.options.getString("delay");
		const targetDate = chronify(timeStr, now);
		if (!targetDate) {
			interaction.reply(`parse failed. \`${timeStr}\` is not a valid time.`);
		}

		if (data.reminders === undefined) {
			data.reminders = {};
		}
		data.reminders[remid] = {};
		data.reminders[remid].date = targetDate;
		data.reminders[remid].channel = interaction.channel.id;
		data.reminders[remid].uid = interaction.user.id;
		data.reminders[remid].text = interaction.options.getString("message");

		interaction.reply(
			`I have set a reminder for ${friendlyFormat(targetDate, now)}.`
		);
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
