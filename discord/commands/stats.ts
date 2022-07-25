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
    .addIntegerOption(value => value.setName("year").setDescription("Jahr"))

export async function execute(interaction: CommandInteraction) {
    const targetUser = interaction.options.getUser("user")
    const year = interaction.options.getInteger("year", false);

    if (year && year < 2020) {
        return await interaction.reply("Vor 2020 wurden leider noch keine Biere getrunken <:assihidethepain:658319611875557396>")
    }

    // setup filter
    const userFilter = targetUser ? { userId: targetUser.id } : {}

    let yearFilter;

    if (year) {
        yearFilter = {
            timestamp: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`)
            }
        }
    } else {
        yearFilter = {}
    }

    const filter = { ...userFilter, ...yearFilter }

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