import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("menü")
  .setDescription("Gib eine Menüempfehlung für den nächsten Stammtisch.")

export async function execute(interaction: CommandInteraction) {
  const mains = ["Schnitzel", "Cordon Bleu"]
  const sides = ["Salat", "Braterdäpfel", "Petersilerdäpfel", "Pommes"]

  const selectedMain = mains[Math.floor(Math.random() * mains.length)]
  const selectedSide = sides[Math.floor(Math.random() * sides.length)]

  let response = `Als Hauptspeise kann ich heute ${selectedMain} mit ${selectedSide} empfehlen.`

  if (selectedSide != "Pommes") {
    response += "\nVielleicht Pommes dazu?"
  }

  await interaction.reply(response)
}