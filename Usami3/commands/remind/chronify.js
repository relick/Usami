const chrono = require("chrono-node");
const parseDuration = require("parse-duration");

const custom = chrono.casual.clone();
custom.refiners.push({
  refine: (context, results) => {
    // If there is no AM/PM (meridiem) specified, get AM if AM is after now, otherwise get PM
    results.forEach((result) => {
      if (
        !result.start.isCertain("meridiem") &&
        result.start.isCertain("hour")
      ) {
        if (result.start.date() < context.refDate) {
          result.start.assign("meridiem", 1);
          result.start.assign("hour", result.start.get("hour") + 12);
        }
      }
    });
    return results;
  },
});
function chronify(str, now = new Date()) {
  const preppedInput = _prepInput(str);
  return custom.parseDate(preppedInput, now, {
    forwardDate: true,
  });
}

function _prepInput(str) {
  if (parseDuration(str)) {
    str = str + " from now ";
  }
  str = str.replace(/and/g, "");
  return str;
}

module.exports = chronify;
