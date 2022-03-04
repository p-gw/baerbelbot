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

  await message.react("👍")
  await message.reply(`Prost <@${message.author.id}>! Ich habe ${beerCount} :beer: hinzugefügt.`)
}