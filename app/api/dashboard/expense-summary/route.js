import { NextResponse } from 'next/server'
import Expense from '@/lib/models/Expense'
import { verifyUser } from '../../../../lib/auth/VerifyUser'

// Helpers
const getMonth = (date) => new Date(date).getMonth()
const getYear = (date) => new Date(date).getFullYear()
const getWeek = (date) => {
  const d = new Date(date)
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = ((d - start) + (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60000)
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
}

export async function GET() {
  try {
   const { success, user, response } = await verifyUser()
  if (!success) return response    
   
    // ✅ Fetch only non-trashed debit expenses
    const expenses = await Expense.find({
      userEmail: user.email,
      type: 'debit',
      trashed: { $ne: true } // 👈 ignore trashed:true
    })

    const now = new Date()
    const thisMonth = getMonth(now)
    const thisYear = getYear(now)
    const thisWeek = getWeek(now)

    let totalMonthlyExpense = 0
    let totalWeeklyExpense = 0
    let pastSixMonthTotals = Array(6).fill(0)

    const thisMonthTxns = expenses.filter(e => {
      const d = new Date(e.datetime)
      return getMonth(d) === thisMonth && getYear(d) === thisYear
    })

    const daysUsed = new Set(thisMonthTxns.map(e => new Date(e.datetime).toDateString())).size || 1
    const dailyAverage = thisMonthTxns.reduce((sum, e) => sum + e.amount, 0) / daysUsed

    for (let i = 0; i < expenses.length; i++) {
      const txn = expenses[i]
      const date = new Date(txn.datetime)

      if (getMonth(date) === thisMonth && getYear(date) === thisYear) {
        totalMonthlyExpense += txn.amount
      }

      if (getWeek(date) === thisWeek && getYear(date) === thisYear) {
        totalWeeklyExpense += txn.amount
      }

      const monthDiff = (thisYear - date.getFullYear()) * 12 + (thisMonth - date.getMonth())
      if (monthDiff >= 0 && monthDiff < 6) {
        pastSixMonthTotals[5 - monthDiff] += txn.amount
      }
    }

    const monthlyAverage = pastSixMonthTotals.reduce((a, b) => a + b, 0) / 6
    const weeklyAverage = totalMonthlyExpense / 4.3 // approx weeks/month

    return NextResponse.json({
      success: true,
      data: {
        totalMonthlyExpense,
        totalWeeklyExpense,
        dailyAverage: Number(dailyAverage.toFixed(2)),
        weeklyAverage: Number(weeklyAverage.toFixed(2)),
        monthlyAverage: Number(monthlyAverage.toFixed(2)),
      }
    })
  } catch (err) {
    console.error('[EXPENSE_SUMMARY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
