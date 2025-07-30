import { NextResponse } from 'next/server'
import Expense from '@/lib/models/Expense'
import { verifyUser } from '../../../../lib/auth/VerifyUser'

const getMonth = (date) => new Date(date).getMonth()
const getYear = (date) => new Date(date).getFullYear()

export async function GET() {
  try {
   const { success, user, response } = await verifyUser()
       if (!success) return response    

    const userEmail = user.email

    const [expenses] = await Promise.all([
      Expense.find({ userEmail, trashed: { $ne: true } }), // ✅ Ignore trashed expenses
    ])

    const monthlyBudget = user?.monthlyBudget || 0

    const creditTxns = expenses.filter(e => e.type === 'credit')
    const debitTxns = expenses.filter(e => e.type === 'debit')

    const totalCredit = creditTxns.reduce((sum, e) => sum + e.amount, 0)
    const totalDebit = debitTxns.reduce((sum, e) => sum + e.amount, 0)
    const totalBalance = totalCredit - totalDebit

    const now = new Date()
    const thisMonth = getMonth(now)
    const thisYear = getYear(now)

    const thisMonthTxns = expenses.filter(e => {
      const d = new Date(e.datetime)
      return getMonth(d) === thisMonth && getYear(d) === thisYear
    })

    const daysUsed = new Set(thisMonthTxns.map(e => new Date(e.datetime).toDateString())).size || 1
    const usedBudget = Math.min(thisMonthTxns
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0),monthlyBudget )

    const remainingBudget = Math.max(monthlyBudget - usedBudget, 0)
    const dailyAverage = usedBudget / daysUsed

    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    const lastMonth = getMonth(lastMonthDate)
    const lastYear = getYear(lastMonthDate)

    const lastMonthTxns = expenses.filter(e => {
      const d = new Date(e.datetime)
      return getMonth(d) === lastMonth && getYear(d) === lastYear
    })

    const lastCredit = lastMonthTxns
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0)
    const lastDebit = lastMonthTxns
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0)

    const lastMonthBalance = lastCredit - lastDebit

    // Most Expended Category
    const categoryMap = {}

    thisMonthTxns.forEach(e => {
      if (e.type === 'debit') {
        if (!categoryMap[e.category]) categoryMap[e.category] = 0
        categoryMap[e.category] += e.amount
      }
    })

    let mostExpendedCategory = null
    if (Object.keys(categoryMap).length > 0) {
      const sorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])
      mostExpendedCategory = {
        name: sorted[0][0],
        amount: sorted[0][1]
      }
    }

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysLeft = Math.max(daysInMonth - daysUsed, 0)

    const goalProgress = monthlyBudget > 0
      ? Math.min(100, ((monthlyBudget - remainingBudget) / monthlyBudget) * 100).toFixed(1)
      : '0.0'

    return NextResponse.json({
      success: true,
      data: {
        monthlyBudget,
        usedBudget,
        remainingBudget,
        goalProgress: Number(goalProgress),
        daysLeft,
        mostExpendedCategory,
        totalCredit,
        totalDebit,
        totalBalance,
        lastMonthBalance,
        dailyAverage: Number(dailyAverage.toFixed(2))
      }
    })
  } catch (err) {
    console.error('[BUDGET_SUMMARY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
