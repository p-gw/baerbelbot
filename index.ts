require("dotenv").config()
import { Client, Intents } from "discord.js"
import * as eventModules from "./discord/events"

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
})

const events = Object(eventModules)

interface Event {
  name: string;
  once?: boolean;
  execute: (...args: any) => void;
}

for (const event of Object.values<Event>(events)) {
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(process.env.DISCORD_TOKEN)