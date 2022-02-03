import { SlashCommandBuilder } from "@discordjs/builders"
import { set, nextThursday, formatDistanceStrict } from "date-fns"
import { de } from "date-fns/locale"
import { CommandInteraction } from "discord.js"

export const data = new SlashCommandBuilder()
  .setName("wann")
  .setDescription("Zeit bis zum nächsten Stammtisch")

export async function execute(interaction: CommandInteraction) {
  const now = new Date()
  const upcoming = set(nextThursday(now), { hours: 19, minutes: 0, seconds: 0, milliseconds: 0 })
  const timeToUpcoming = formatDistanceStrict(now, upcoming, { locale: de })
  await interaction.reply(`Und da wächst die Lust auf ein :beer:! Nur noch ${timeToUpcoming} bis zum nächsten Stammtisch...`)
}
