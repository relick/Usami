const { format, formatRelative, subDays, addDays } = require("date-fns");

function friendlyFormat(date, now) {
	if (date > subDays(now, 6) && date < addDays(now, 6)) {
		return formatRelative(date, now);
	}
	// "6 Jan 2020 08:40 PM"
	return format(date, "d MMM yyyy hh:mm b");
}

module.exports = friendlyFormat;
