import { Prisma, PrismaClient } from "@prisma/client"
import { endOfWeek, nextThursday, set, startOfWeek } from "date-fns"
const prisma = new PrismaClient()

interface WeeklyAmounts {
  userId?: string
  date: Date
  amount: number
}

export const weeklyAmount = async (
  where: { userId: string } | {} = {},
  by: Prisma.ConsumptionScalarFieldEnum[] | null = null,
  removeZeros: boolean = true
): Promise<WeeklyAmounts[]> => {
  const extent = await prisma.consumption.aggregate({
    where: { userId: { not: "offset" } },
    _min: { timestamp: true },
    _max: { timestamp: true }
  })

  if (!extent._min.timestamp) throw new Error("Invalid minimum date");
  if (!extent._max.timestamp) throw new Error("Invalid maximum date");

  const daterange = {
    min: extent._min.timestamp,
    max: extent._max.timestamp
  }

  let weeklyAmounts: WeeklyAmounts[] = [];
  let activeDate = set(daterange.min, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0 })

  while (activeDate < daterange.max) {
    if (by) {
      let weeklyAggregate = await prisma.consumption.groupBy({
        by: by,
        _sum: { amount: true },
        where: {
          ...where,
          AND: [
            { userId: { not: "offset" } },
            { timestamp: { gte: startOfWeek(activeDate) } },
            { timestamp: { lte: endOfWeek(activeDate) } }
          ]
        },
      })

      for (const week of weeklyAggregate) {
        const tmpAmounts: any = { ...week }
        delete tmpAmounts._sum
        weeklyAmounts.push({
          ...(tmpAmounts),
          date: activeDate,
          amount: week._sum.amount || 0
        })
      }
    } else {
      let weeklyAggregate = await prisma.consumption.aggregate({
        _sum: { amount: true },
        where: {
          ...where,
          AND: [
            { userId: { not: "offset" } },
            { timestamp: { gte: startOfWeek(activeDate) } },
            { timestamp: { lte: endOfWeek(activeDate) } }
          ]
        }
      })

      weeklyAmounts.push({
        date: activeDate,
        amount: weeklyAggregate._sum.amount || 0
      })
    }

    activeDate = nextThursday(activeDate)
  }

  if (removeZeros) {
    return weeklyAmounts.filter(d => d.amount > 0)
  } else {
    return weeklyAmounts
  }
}

export const sum = (arr: number[]): number => {
  return arr.reduce((acc, cur) => acc + cur)
}

export const mean = (arr: number[]): number => sum(arr) / arr.length