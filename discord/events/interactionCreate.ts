import * as commandModules from "../commands"

const commands = Object(commandModules)
export const name = "interactionCreate"

export async function execute(interaction: any) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction

  try {
    await commands[commandName].execute(interaction)
  } catch (e) {
    console.error(e)
    await interaction.reply({
      content: "Es ist ein Fehler aufgetreten!",
      ephemeral: true
    })
  }

}
