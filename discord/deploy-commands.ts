require("dotenv").config()
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import * as commandModules from "./commands"
import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

const token = process.env.DISCORD_TOKEN || ""
const clientId = process.env.DISCORD_CLIENT_ID || ""
const guildId = process.env.DISCORD_GUILD_ID || ""

type Command = {
    data: SlashCommandBuilder
    execute: (interaction: CommandInteraction) => void
}

const commands = Object(commandModules)

const body = [];
for (const module of Object.values<Command>(commands)) {
    body.push(module.data.toJSON())
}

const rest = new REST({ version: "9" }).setToken(token)

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: body })
    .then(() => console.log("Sucessfully registered application commands!"))
    .catch(e => console.error(e))
