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

    const reactEmojis = [
        "👍",
        "👌",
        "<:haeupl:480761263253618698>",
        "<:120:740162490905657344>",
        "<:strolz:477753953053048842>",
        "<:ohmygod:431963369356918795>",
        "<:zipfer:618092775451394059>"
    ]

    const reactEmoji = reactEmojis[Math.floor(Math.random() * reactEmojis.length)]

    await message.react(reactEmoji)
    await message.reply(`Prost <@${message.author.id}>! Ich habe ${beerCount} :beer: hinzugefügt.`)
}