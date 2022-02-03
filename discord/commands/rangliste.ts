import { SlashCommandBuilder } from "@discordjs/builders"
import { PrismaClient } from "@prisma/client"
import { CommandInteraction } from "discord.js"
const prisma = new PrismaClient()

export const data = new SlashCommandBuilder()
  .setName("rangliste")
  .setDescription("Berechne die :beer: Rangliste aller Benutzer.")

export async function execute(interaction: CommandInteraction) {
  const ranking = await prisma.consumption.groupBy({
    by: ["userId"],
    where: {
      user: {
        username: {
          not: "offset"
        }
      }
    },
    _sum: {
      amount: true
    },
    orderBy: {
      _sum: {
        amount: "desc"
      }
    }
  })

  let response = `**Rangliste**\n`;
  for (let i = 0; i < ranking.length; i++) {
    const userId = ranking[i].userId
    const userTotal = ranking[i]._sum.amount
    response += `${i + 1}. <@${userId}> - ${userTotal} :beers:\n`
  }

  await interaction.reply(response)
}
