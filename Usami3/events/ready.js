module.exports = {
	name: 'ready',
	once: true,
	execute(data, config, client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};