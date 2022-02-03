require("dotenv").config()
import { User, PrismaClient } from "@prisma/client"
import express from "express"
import { weeklyAmount } from "../discord/utils"
const prisma = new PrismaClient()

const api = express()
const PORT = process.env.API_PORT

api.get("/weekly", async (req, res) => {
  const weeklyAmounts = await weeklyAmount({}, ["userId"], false)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true
    }
  })

  let responseData: { userId: string | undefined, username: string | undefined, date: Date, amount: number }[] = [];

  for (let amount of weeklyAmounts) {
    const user = users.find(user => user.id === amount.userId)
    responseData.push({
      userId: amount.userId,
      username: user ? user.username : undefined,
      date: amount.date,
      amount: amount.amount
    })
  }

  res.send(responseData)
})

api.listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`)
})
