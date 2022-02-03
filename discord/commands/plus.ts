import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js";
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const data = new SlashCommandBuilder()
  .setName("plus")
  .setDescription("Füge Werte für einen Benutzer in der Datenbank hinzu.")
  .addIntegerOption(value =>
    value.setName("value")
      .setDescription("Anzahl")
      .setRequired(true))
  .addUserOption(option =>
    option.setName("user")
      .setDescription("Ein Benutzer")
      .setRequired(true))

export async function execute(interaction: CommandInteraction) {
  const targetUser = interaction.options.getUser("user", true)
  const value = interaction.options.getInteger("value", true)

  await prisma.user.upsert({
    where: { id: targetUser.id },
    create: {
      id: targetUser.id,
      username: targetUser.username,
      firstSeen: new Date(),
      beers: {
        create: {
          amount: value
        }
      }
    },
    update: {
      beers: {
        create: {
          amount: value
        }
      }
    }
  })

  await interaction.reply(`${Math.abs(value)} :beer: für <@${targetUser.id}> ${value < 0 ? 'entfernt' : 'hinzugefügt'}.`)
}
