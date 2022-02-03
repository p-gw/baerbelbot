import { SlashCommandBuilder } from "@discordjs/builders"
import { PrismaClient } from "@prisma/client"
import { format } from "date-fns"
import { CommandInteraction } from "discord.js"
import { mean, weeklyAmount } from "../utils"

const prisma = new PrismaClient()

export const data = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Berechne die :beer: Statistiken für einen Benutzer.")
  .addUserOption(option => option.setName("user").setDescription("Ein Benutzer"))

export async function execute(interaction: CommandInteraction) {
  const targetUser = interaction.options.getUser("user")
  const filter = targetUser ? { userId: targetUser.id } : {}
  const results = await prisma.consumption.aggregate({
    where: filter,
    _sum: { amount: true },
    _min: { timestamp: true }
  })

  if (!results._min.timestamp) {
    throw new Error("invalid date")
  }

  const weekly = await weeklyAmount(filter)
  const weeklyAverage = mean(weekly.map(d => d.amount))

  let reply: string;
  const date = format(results._min.timestamp, "dd.MM.yyyy")
  if (targetUser) {
    reply = `<@${targetUser.id}> hat seit ${date} insgesamt ${results._sum.amount} :beers: getrunken!`
  } else {
    reply = `Seit ${date} wurden insgesamt ${results._sum.amount} :beers: getrunken!`
  }
  reply += `\nIm Durchschnitt sind das ${Math.round(weeklyAverage * 10) / 10} :beers: pro Stammtisch.`
  await interaction.reply(reply)
}