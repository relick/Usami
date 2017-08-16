// RelickBot.cpp : Defines the entry point for the console application.
//
#include "stdafx.h"
#include <iostream>
#include <sstream>
#include <websocketpp_websocket.h>
#include <sol.hpp>

std::stringstream sbuf;

std::string escapeJson(const std::string& s) {
	std::ostringstream o;
	for (auto c : s) {
		switch (c) {
		case '"':
			o << "\\\"";
			break;
		case '\\':
			o << "\\\\";
			break;
		case '\b':
			o << "\\b";
			break;
		case '\f':
			o << "\\f";
			break;
		case '\n':
			o << "\\n";
			break;
		case '\r':
			o << "\\r";
			break;
		case '\t':
			o << "\\t";
			break;
		default:
			if ('\x00' <= c && c <= '\x1f') {
				o << "\\u" << std::hex << std::setw(4) << std::setfill('0')
					<< static_cast<int>(c);
			} else {
				o << c;
			}
		}
	}
	return o.str();
}

int l_my_print(std::string s) {
	sbuf << s;
	return 0;
}

struct RelickBot : public SleepyDiscord::DiscordClient {
	using SleepyDiscord::DiscordClient::DiscordClient;
	void relickBotSetup() {
	}

	SleepyDiscord::Message embedSendMessage(std::string channel_id, std::string message, bool cleanupmessage) {
		int off = 0;
		std::string cleanMess;
		if (cleanupmessage) {
			cleanMess = escapeJson(message);
		} else {
			cleanMess = message;
		}
		std::ostringstream mess;
		mess << R"({
	"embed": {
		"description": ")" << cleanMess << R"(",
		"color": 3447003,
		"title": "Your code output"
	}
})";
		std::string response = request(SleepyDiscord::RequestMethod::Post, path("channels/{channel.id}/messages", channel_id), mess.str()).text;
		return SleepyDiscord::Message(&response);
	}

	void onMessage(SleepyDiscord::Message message) {
		if (message.startsWith("=lua ")) {
			sol::state lua;
			lua.open_libraries(sol::lib::base, sol::lib::package);
			lua.set_function("newprint", l_my_print);
			static std::string setscr = R"(_print = print
function print(s)
	newprint(s)
	_print(s)
end)";
			lua.script(setscr);
			std::string script = message.content;
			script.erase(0, 5);
			auto result = lua.script(script, [this, message](lua_State* L, sol::protected_function_result pfr) {
				// pfr will contain things that went wrong, for either loading or executing the script
				// Can throw your own custom error
				// You can also just return it, and let the call-site handle the error if necessary.
				return pfr;
			});
			std::string output = sbuf.str();
			if (!result.valid()) {
				output = result;
			}
			sbuf.clear();
			sbuf.str(std::string());
			if (output.empty()) {
				embedSendMessage(message.channel_id, "No error, no output", false);
			} else {
				embedSendMessage(message.channel_id, output, true);
			}
		}
	}
};

int main() {
	RelickBot client("MzQ3Mzk2ODQ3NzY3MjU3MTA4.DHXykw.QnK42oQ8nqDp3sPQP6_VbbRbTJQ", 2);
	client.relickBotSetup();
	client.run();
}
