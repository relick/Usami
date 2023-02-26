const chronify = require("../commands/remind/chronify");

describe("Parses date", function () {
	const now = new Date("2023-02-26 10:20:30");

	it("parses durations correctly", function () {
		expect(testChronify("10s")).toEqual(new Date("2023-02-26 10:20:40"));
		expect(testChronify("90 seconds")).toEqual(new Date("2023-02-26 10:22:00"));
		expect(testChronify("5m")).toEqual(new Date("2023-02-26 10:25:30"));
		expect(testChronify("in 5m")).toEqual(new Date("2023-02-26 10:25:30"));
		expect(testChronify("5 mins")).toEqual(new Date("2023-02-26 10:25:30"));
		expect(testChronify("4h")).toEqual(new Date("2023-02-26 14:20:30"));
		expect(testChronify("in 4h")).toEqual(new Date("2023-02-26 14:20:30"));
		expect(testChronify("4 hours from now")).toEqual(new Date("2023-02-26 14:20:30"));
		expect(testChronify("1 day")).toEqual(new Date("2023-02-27 10:20:30"));
		expect(testChronify("in 1 week")).toEqual(new Date("2023-03-05 10:20:30"));
	});

	it("parses mixed durations", function () {
		expect(testChronify("5h 5m")).toEqual(new Date("2023-02-26 15:25:30"));
		expect(testChronify("in 5h 5m")).toEqual(new Date("2023-02-26 15:25:30"));
		expect(testChronify("in 1 week 2 days 3 hours")).toEqual(new Date("2023-03-07 13:20:30"));
		expect(testChronify("in 1 week 2 days and 3 hours")).toEqual(
			new Date("2023-03-07 13:20:30")
		);
	});

	it("parses decimal durations", function () {
		expect(testChronify("1.25m")).toEqual(new Date("2023-02-26 10:21:45"));
		expect(testChronify("5.5 hour")).toEqual(new Date("2023-02-26 15:50:30"));
	});

	it("parses specific time", function () {
		expect(testChronify("today at 9")).toEqual(new Date("2023-02-26 21:00:00"));
		expect(testChronify("today at 11:52")).toEqual(new Date("2023-02-26 11:52:00"));
		expect(testChronify("today at 18:40")).toEqual(new Date("2023-02-26 18:40:00"));
		expect(testChronify("6:40 pm today")).toEqual(new Date("2023-02-26 18:40:00"));
		expect(testChronify("7pm")).toEqual(new Date("2023-02-26 19:00:00"));
		expect(testChronify("tomorrow")).toEqual(new Date("2023-02-27 10:20:30"));
		expect(testChronify("friday")).toEqual(new Date("2023-03-03 12:00:00"));
		expect(testChronify("next friday")).toEqual(new Date("2023-03-03 12:00:00"));
		expect(testChronify("next week")).toEqual(new Date("2023-03-05 10:20:30"));
		expect(testChronify("two weeks")).toEqual(new Date("2023-03-12 10:20:30"));
		expect(testChronify("friday 10am")).toEqual(new Date("2023-03-03 10:00:00"));
		expect(testChronify("04/01/2023")).toEqual(new Date("2023-04-01 12:00:00"));
		expect(testChronify("six months from now")).toEqual(new Date("2023-08-26 11:20:30")); // DST!
		expect(testChronify("a year")).toEqual(new Date("2024-02-26 10:20:30"));
	});

	function testChronify(str) {
		return chronify(str, now);
	}
});
