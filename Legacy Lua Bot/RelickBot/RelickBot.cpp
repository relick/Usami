// RelickBot.cpp : Defines the entry point for the console application.
//
#include "stdafx.h"
#include <iostream>
#include <sstream>
#include <websocketpp_websocket.h>
#include <sol.hpp>
#include <fstream>
#include <chrono>
#include <future>

std::stringstream sbuf;
sol::state lua;

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

std::string unescapeLua(const std::string& s) {
	std::ostringstream o;
	for (int i = 0; i < ((int)s.size()); ++i) {
		if (s[i] == '\\') {
			switch (s[i + 1]) {
			case '\\':
				o << '\\';
				++i;
				break;
			case '"':
				o << '\"';
				++i;
				break;
			case 'n':
				o << '\n';
				++i;
				break;
			case 't':
				o << '\t';
				++i;
				break;
			default:
				o << '\\';
				++i;
				break;
			}
		} else {
			o << s[i];
		}
	}
	return o.str();
}

int l_my_print(sol::variadic_args va) {
	for (auto v : va) {
		std::string x = v.get<std::string>();
		sbuf << x << ' ';
	}
	sbuf << std::endl;
	return 0;
}

sol::protected_function_result nya(std::string s) {
	return lua.do_string(s);
}

struct RelickBot : public SleepyDiscord::DiscordClient {
	using SleepyDiscord::DiscordClient::DiscordClient;

	std::vector<std::string> channels;
	std::vector<std::string> users;

	void addChannel(std::string x) {
		channels.push_back(x);
	}

	void addUser(std::string x) {
		users.push_back(x);
	}

	void relickBotSetup() {
		lua = sol::state();
		lua.open_libraries(sol::lib::base, sol::lib::package);
		lua.set_function("newprint", l_my_print);
		static std::string setscr = R"(_print = print
function print(...)
	newprint(...)
	_print(...)
end)";
		lua.script(setscr);
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
		"color": 3464018,
		"author": {
			"name": "Lua",
			"icon_url": "http://d2.alternativeto.net/dist/icons/lua_102040.png?width=200&height=200&mode=crop&upscale=false"
		},
		"title": "Your code output"
	}
})";
		std::string response = request(SleepyDiscord::RequestMethod::Post, path("channels/{channel.id}/messages", channel_id), mess.str()).text;
		return SleepyDiscord::Message(&response);
	}

	void onMessage(SleepyDiscord::Message message) {
		if (message.startsWith("=whitelist")) {
			if (message.author.id == users[0]) {
				std::cout << "Channel ID: " << message.channel_id << std::endl;
				addChannel(message.channel_id);
				std::string mess = message.content;
				mess.erase(0, 10);
				if (mess.size() != 0) {
					embedSendMessage(message.channel_id, message.author.id, true);
				}
			}
		} else {
			for (std::string c : channels) {
				if (c == message.channel_id) {
					if (message.startsWith("=ep ```lua")) {
						std::string script = message.content;
						script.erase(0, 10);
						script.erase(((int)script.size()) - 3, 3);
						script = unescapeLua(script);
						//std::future<sol::protected_function_result> result = std::async(lua.script, script, [](lua_State* L, sol::protected_function_result pfr) { return pfr; });
						//std::chrono::milliseconds span(100);
						//if (result.wait_for(span) == std::future_status::timeout) {
						//	embedSendMessage(message.channel_id, "Timed out!", false);
						//} else {
							std::string output = sbuf.str();
							//if (!result.get().valid()) {
							//	output = result.get();
							//}
							sbuf.clear();
							sbuf.str(std::string());
							if (output.empty()) {
								embedSendMessage(message.channel_id, "No error, no output.", false);
							} else {
								embedSendMessage(message.channel_id, "```" + output + "```", true);
							}
						//}
					} else if (message.startsWith("=luareset")) {
						relickBotSetup();
						embedSendMessage(message.channel_id, "Your lua state has been reset!", true);
					} else if (message.startsWith("=ef ```lua")) {
						std::string script = message.content;
						script.erase(0, 10);
						script.erase(((int)script.size()) - 3, 3);
						script = unescapeLua(script);
						std::future<sol::protected_function_result> result = std::async(nya, script);
						std::chrono::milliseconds span(100);
						if (result.wait_for(span) == std::future_status::timeout) {
							embedSendMessage(message.channel_id, "Timed out!", false);
						} else {
							std::string output = sbuf.str();
							if (result.valid()) {
								output = result.get();
							}
							sbuf.clear();
							sbuf.str(std::string());
							if (output.empty()) {
								embedSendMessage(message.channel_id, "No error, no output.", false);
							} else {
								embedSendMessage(message.channel_id, "```" + output + "```", true);
							}
						}
					} else if (message.startsWith("=help")) {
						std::string mess = R"(The bot has the following commands:
```=ef```
This command executes a block of lua code as if it was a function (contained in \`\`\`lua ... \`\`\` code blocks), and the bot outputs the return value.
```=ep```
This command executes a block of lua code (contained in \`\`\`lua ... \`\`\` code blocks), and the bot outputs anything sent to the console with `print()`.)";
						embedSendMessage(message.channel_id, mess, true);
					}
				}
			}
		}
	}
};

int main() {
	std::ifstream file;
	file.open("botdata.txt");
	if (file) {
		std::string x;
		file >> x;
		RelickBot client(x, 2);
		client.relickBotSetup();
		while (file >> x) {
			if (x[0] == 'c') {
				x.erase(0, 1);
				client.addChannel(x);
			} else {
				x.erase(0, 1);
				client.addUser(x);
			}
		}
		file.close();
		client.run();
	}
}
