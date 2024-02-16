import { SlashCommandBuilder } from "@discordjs/builders"
import { PrismaClient } from "@prisma/client"
import { CommandInteraction } from "discord.js"
const prisma = new PrismaClient()

export const data = new SlashCommandBuilder()
    .setName("rangliste")
    .setDescription("Berechne die :beer: Rangliste aller Benutzer.")
    .addIntegerOption(value => value.setName("year")
        .setDescription("Jahr")
        .setRequired(false))

export async function execute(interaction: CommandInteraction) {
    const year = interaction.options.getInteger("year", false)
    const baseFilter = { user: { username: { not: "offset" } } }

    if (year && year < 2020) {
        return await interaction.reply("Für die Jahre vor 2020 gibt es leider keine Rangliste... <:assihidethepain:658319611875557396>")
    }

    let filter;
    if (year) {
        filter = {
            ...baseFilter, timestamp: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`)
            }
        }
    } else {
        filter = baseFilter
    }

    const ranking = await prisma.consumption.groupBy({
        by: ["userId"],
        where: filter,
        _sum: {
            amount: true
        },
        orderBy: {
            _sum: {
                amount: "desc"
            }
        }
    })

    let response = `**Rangliste**`;
    let currentRank: number = 1;
    let previousUserTotal: number | undefined;

    if (year) {
        response += ` (Jahr: ${year})`;
    }
    response += "\n";

    for (let i = 0; i < ranking.length; i++) {
        const userId = ranking[i].userId
        const userTotal = ranking[i]._sum.amount

        if (previousUserTotal !== undefined && userTotal !== previousUserTotal) {
            currentRank = i + 1;
        }

        response += `${currentRank}. <@${userId}> - ${userTotal} :beers:\n`
        previousUserTotal = userTotal;
    }

    await interaction.reply(response)
}
