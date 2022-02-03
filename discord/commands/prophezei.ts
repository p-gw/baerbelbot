require("dotenv").config()

import fs from "fs";
import path from "path";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, DiscordAPIError, MessageEmbed } from "discord.js";

const SHARED_DATA_DIR = process.env.SHARED_DATA_DIR || "./"
const PLOT_DIR = path.join(SHARED_DATA_DIR, "plots")

export const data = new SlashCommandBuilder()
  .setName("prophezei")
  .setDescription("Erstelle eine Vorhersage für das Jahresende.")
  .addUserOption(option => option.setName("user").setDescription("Ein Benutzer").setRequired(true))

export async function execute(interaction: CommandInteraction) {
  const targetUser = interaction.options.getUser("user")
  if (!targetUser) throw new Error("Invalid user");

  const embed = new MessageEmbed()
    .setTitle("Vorhersage")

  const plot = fs.readdirSync(PLOT_DIR)
    .find(file => file.includes(targetUser.id))

  if (!plot) throw new Error("No file found");

  interaction.reply({ embeds: [embed], files: [path.join(PLOT_DIR, plot)] })
}
