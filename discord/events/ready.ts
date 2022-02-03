import { Client, ClientApplication } from "discord.js"

export const name = "ready"
export const once = true

export function execute(client: Client) {
  if (client.user) {
    console.log(`Ready! Logged in as ${client.user.tag}`)
  }
}
