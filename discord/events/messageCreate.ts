import { Interaction, Message } from "discord.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

export const name = "messageCreate"

export async function execute(message: Message) {
    const nBeers = message.content.match(/🍺/g)
    if (!nBeers) return;

    const beerCount = nBeers.length

    await prisma.user.upsert({
        where: { id: message.author.id },
        create: {
            id: message.author.id,
            username: message.author.username,
            firstSeen: new Date(),
            beers: {
                create: {
                    amount: beerCount
                }
            }
        },
        update: {
            lastSeen: new Date(),
            beers: {
                create: {
                    amount: beerCount
                }
            }
        }
    })

    const baseEmojis = ["👍", "👌"]
    const guildEmojis = message.guild?.emojis.cache.map((e, id) => `<:${e.name}:${id}>`)
    const reactEmojis = baseEmojis.concat(guildEmojis || [])
    const reactEmoji = reactEmojis[Math.floor(Math.random() * reactEmojis.length)]

    try {
        await message.react(reactEmoji)
    } catch (error) {
        await message.react('👍')
    } finally {
        await message.reply(`Prost <@${message.author.id}>! Ich habe ${beerCount} :beer: hinzugefügt.`)
    }
}
