import { CommandInteraction } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Antworte mit Pong!")

export async function execute(interaction: CommandInteraction) {
  await interaction.reply("Pong!")
}
