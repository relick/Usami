// RelickBot.cpp : Defines the entry point for the console application.
//
#include "stdafx.h"
#include <iostream>
#include <sstream>
#include <websocketpp_websocket.h>
#include <sol.hpp>

std::stringstream sbuf;

static int l_my_print(lua_State* L) {
	int nargs = lua_gettop(L);

	for (int i = 1; i <= nargs; i++) {
		if (lua_isstring(L, i)) {
			/* Pop the next arg using lua_tostring(L, i) and do your print */
		} else {
			/* Do something with non-strings if you like */
		}
	}

	return 0;
}

static int l_my_print2(std::string s) {
	sbuf << s;
	return 0;
}

struct RelickBot : public SleepyDiscord::DiscordClient {
	using SleepyDiscord::DiscordClient::DiscordClient;
	void relickBotSetup() {
	}

	void onMessage(SleepyDiscord::Message message) {
		if (message.startsWith("=lua ")) {
			sol::state lua;
			lua.open_libraries(sol::lib::base, sol::lib::package);
			lua.set_function("newprint", l_my_print2);
			static std::string setscr = R"(newprint('hello'))";
			lua.script(setscr);
			//lua["print"] = sol::overload(l_my_print);
			std::string script = message.content;
			script.erase(0, 5);
			auto result = lua.script(script, [this, message](lua_State* L, sol::protected_function_result pfr) {
				// pfr will contain things that went wrong, for either loading or executing the script
				// Can throw your own custom error
				// You can also just return it, and let the call-site handle the error if necessary.
				return pfr;
			});
			sendMessage(message.channel_id, "[string t]:1: '=' expected near '<eof>'");
			std::string output = sbuf.str();
			if (!result.valid()) {
				output = result;
			}
			sbuf.clear();
			if (output.empty()) {
				sendMessage(message.channel_id, "No error, no output");
			} else {
				bool done = false;
				int index = 0;
				while (!done) {
					if (index >= ((int)output.length())) {
						done = true;
						break;
					}
					std::stringstream ss;
					for (int i = index; i < ((int)output.length()); ++i) {
						++index;
						if (output[i] != '\n')
							ss << output[i];
						else
							break;
					}
					if (!ss.str().empty())
						sendMessage(message.channel_id, ss.str());
				}
			}
		}
	}
};

int main() {
	RelickBot client("MzQ3Mzk2ODQ3NzY3MjU3MTA4.DHXykw.QnK42oQ8nqDp3sPQP6_VbbRbTJQ", 2);
	client.relickBotSetup();
	client.run();
}
