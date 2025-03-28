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
		data.reminders[remid].server = interaction.guild.id;
		data.reminders[remid].channel = interaction.channel.id;
		data.reminders[remid].uid = interaction.user.id;
		data.reminders[remid].text = interaction.options.getString("message");
		data.reminders[remid].dateSet = now;

		interaction.reply({
			content: `I have set a reminder for ${friendlyFormat(targetDate, now)}. Message:\n> ${data.reminders[remid].text}`,
			fetchReply: true
		})
		.then((reponseMessage) => data.reminders[remid].remMsgID = reponseMessage.id)
		.catch(console.error);
	},

	repeat(client, data, config) {
		for (let c in data.reminders) {
			if (new Date(data.reminders[c].date) < new Date()) {
				if (data.reminders[c].server !== undefined) {
					const dateSet = friendlyFormat(new Date(data.reminders[c].dateSet), new Date());
					if (data.reminders[c].remMsgID !== undefined) {
						const linkBack = `${data.reminders[c].server}/${data.reminders[c].channel}/${data.reminders[c].remMsgID}`;
						client.channels.cache.get(data.reminders[c].channel).send(`<@${data.reminders[c].uid}>!\n> ${data.reminders[c].text}\nhttps://discord.com/channels/${linkBack} was set ${dateSet}.`);
					}
					else {
						// Missing reply message to link to
						client.channels.cache.get(data.reminders[c].channel).send(`<@${data.reminders[c].uid}>!\n> ${data.reminders[c].text}\nReminder was set ${dateSet}.`);
					}
				}
				else {
					// Old reminder
					client.channels.cache.get(data.reminders[c].channel).send(`<@${data.reminders[c].uid}>!\n> ${data.reminders[c].text}`);
				}
				delete data.reminders[c];
			}
		}
	},
};
