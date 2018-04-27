import discord
import asyncio
import sys
import datetime

counter = 0
client = discord.Client()
prepping = False
msat = 0
msun = 0

satcounty = []
satcountn = []
suncounty = []
suncountn = []

@client.event
async def on_ready():
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)
    print('------')

@client.event
async def on_message(message):
    global counter
    global msat
    global msun
    global prepping
    if (message.server.id == '298845318454312962' or message.server.id == '167209063480950785') and message.author.id != '347396847767257108':
        if message.content.startswith('boop'):
            counter += 1
            if counter%10 == 0:
                await client.send_message(message.author, "What the fuck did you just fucking say about me, you little bitch? I’ll have you know I graduated top of my class in the Navy Seals, and I’ve been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I’m the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You’re fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that’s just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little “clever” comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn’t, you didn’t, and now you’re paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You’re fucking dead, kiddo.")
            elif counter%5 == 0:
                await client.send_message(message.channel, "pls stop")
            await client.send_message(message.channel, "boop")
        elif message.content.lower().find('bug') > -1:
            pass
            #await client.send_message(message.channel, message.server.get_member("95649702455803904").mention)
        elif message.content.lower() == 'bot' or message.content.lower().startswith('bot ') or message.content.lower().endswith(' bot') or message.content.lower().find(' bot ') > -1:
            await client.send_message(message.channel, "been here all along :eyes:")
    
    if message.server.id == '298845318454312962':
        if message.content.startswith('~schedule'):
            await client.send_message(message.channel, "@everyone | " + message.author.name + " wants to schedule a D&D game.")
            msat = await client.send_message(message.channel, "Please tick this if you can play on Saturday and cross it if you can't.")
            await client.add_reaction(msat, "✅")
            await client.add_reaction(msat, "❌")
            msun = await client.send_message(message.channel, "Please tick this if you can play on Sunday and cross it if you can't.")
            await client.add_reaction(msun, "✅")
            await client.add_reaction(msun, "❌")
            prepping = True

@client.event
async def on_reaction_add(reaction, user):
    global msat
    global msun
    global prepping
    global satcounty
    global satcountn
    global suncounty
    global suncountn
    if prepping and user.id != '347396847767257108':
        nya = False
        if reaction.message.id == msat.id:
            if reaction.emoji == "✅":
                if satcountn.count(user.id) > 0:
                    await client.remove_reaction(msat, "❌", user)
                    nya = True
                satcounty.append(user.id)
            elif reaction.emoji == "❌":
                if satcounty.count(user.id) > 0:
                    await client.remove_reaction(msat, "✅", user)
                    nya = True
                satcountn.append(user.id)
        elif reaction.message.id == msun.id:
            if reaction.emoji == "✅":
                if suncountn.count(user.id) > 0:
                    await client.remove_reaction(msun, "❌", user)
                    nya = True
                suncounty.append(user.id)
            elif reaction.emoji == "❌":
                if suncounty.count(user.id) > 0:
                    await client.remove_reaction(msun, "✅", user)
                    nya = True
                suncountn.append(user.id)
        if not nya and max(len(satcounty) + len(satcountn), len(suncounty) + len(suncountn)) == 6:
            k = 0
            if len(suncounty) == 6:
                k = await client.send_message(reaction.message.channel, "@everyone | Team 1, Sunday, 11am GMT.")
            elif len(satcounty) == 6:
                k = await client.send_message(reaction.message.channel, "@everyone | Team 1, Saturday, 11am GMT.")
            elif len(suncounty) >= 4:
                k = await client.send_message(reaction.message.channel, "@everyone | Team N, Sunday, 11am GMT.")
            elif len(satcounty) >= 4:
                k = await client.send_message(reaction.message.channel, "@everyone | Team N, Saturday, 11am GMT.")
            else:
                k = await client.send_message(reaction.message.channel, "@everyone | Not enough players for a game. :frowning:")
            await client.pin_message(k)
            prepping = False

@client.event
async def on_reaction_remove(reaction, user):
    global msat
    global msun
    global prepping
    global satcounty
    global satcountn
    global suncounty
    global suncountn
    if prepping and user.id != '347396847767257108':
        if reaction.message.id == msat.id:
            if reaction.emoji == "✅":
                satcounty.remove(user.id)
            elif reaction.emoji == "❌":
                satcountn.remove(user.id)
        elif reaction.message.id == msun.id:
            if reaction.emoji == "✅":
                suncounty.remove(user.id)
            elif reaction.emoji == "❌":
                suncountn.remove(user.id)

if __name__ == "__main__":
    with open('token') as fi:
        client.run(fi.read()[:-1])
