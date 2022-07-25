import { SlashCommandBuilder } from "@discordjs/builders";
import { PrismaClient } from "@prisma/client";
import { CommandInteraction, DataResolver } from "discord.js";

const prisma = new PrismaClient()

export const data = new SlashCommandBuilder()
    .setName("heute")
    .setDescription("Berechne die heutige :beer: Statistik")
    .addUserOption(option => option.setName("user").setDescription("Ein Benutzer"))

export async function execute(interaction: CommandInteraction) {
    const targetUser = interaction.options.getUser("user", false)
    const userFilter = targetUser ? { userId: targetUser.id } : {}

    const currentDate = new Date()
    currentDate.setUTCHours(0, 0, 0, 0)

    const results = await prisma.consumption.aggregate({
        where: {
            ...userFilter,
            timestamp: {
                gte: currentDate
            }
        },
        _sum: { amount: true }
    })

    let reply: string;

    if (targetUser) {
        reply = `<@${targetUser.id}> hat heute insgesamt ${results._sum.amount} :beers: getrunken.`
    } else {
        reply = `Heute wurden insgesamt ${results._sum.amount} :beers: getrunken.`
    }

    return await interaction.reply(reply)
}