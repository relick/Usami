import discord
import asyncio
import sys

client = discord.Client()

@client.event
async def on_ready():
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)
    print('------')

@client.event
async def on_message(message):
    if message.server.id == '298845318454312962':
        if message.content.startswith('=makedate'):
            pass

if __name__ == "__main__":
    with open('token') as fi:
        client.run(fi.read()[:-1])
