import { NextResponse } from 'next/server'
import Expense from '@/lib/models/Expense'
import { verifyUser } from '../../../../lib/auth/VerifyUser'

const getWeekNumber = (date) => {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = ((date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000))
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
}

export async function GET() {
  try {

    const { success, user, response } = await verifyUser()
    if (!success) return response    
       
   
    const userEmail = user.email

    // ✅ Only non-trashed expenses
    const expenses = await Expense.find({
      userEmail,
      trashed: { $ne: true }
    })

    const now = new Date()

    // 1️⃣ Account Balance Trend (Line Chart)
    const balanceTrend = Array.from({ length: 4 }, (_, i) => {
      const startOfWeek = new Date()
      startOfWeek.setDate(now.getDate() - (7 * (3 - i)))
      const week = getWeekNumber(startOfWeek)

      const weeklyTxns = expenses.filter(e => getWeekNumber(new Date(e.datetime)) === week)
      const income = weeklyTxns.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0)
      const expense = weeklyTxns.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0)

      return {
        name: `Week ${week}`,
        balance: income - expense,
      }
    })

    // 2️⃣ Expense Pattern (Bar Chart)
    const expensePattern = Array.from({ length: 4 }, (_, i) => {
      const startOfWeek = new Date()
      startOfWeek.setDate(now.getDate() - (7 * (3 - i)))
      const week = getWeekNumber(startOfWeek)

      const weeklyTxns = expenses.filter(e =>
        getWeekNumber(new Date(e.datetime)) === week && e.type === 'debit'
      )
      const total = weeklyTxns.reduce((sum, e) => sum + e.amount, 0)

      return {
        name: `Week ${week}`,
        expense: total,
      }
    })

    // 3️⃣ Budget Utilization (Area Chart)
    const budgetUtilization = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date()
      weekStart.setDate(now.getDate() - (7 * (3 - i)))
      const week = getWeekNumber(weekStart)

      const txns = expenses.filter(e => getWeekNumber(new Date(e.datetime)) === week)
      const income = txns.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0)
      const expense = txns.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0)

      return {
        name: `Week ${week}`,
        income,
        expense,
      }
    })

    // 4️⃣ Category-wise Expenditure (Pie Chart)
    const categoryMap = {}
    expenses.forEach(e => {
      if (e.type === 'debit') {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
      }
    })
    const categoryWise = Object.entries(categoryMap).map(([name, price]) => ({ name, price }))

    return NextResponse.json({
      success: true,
      data: {
        balanceTrend,
        expensePattern,
        budgetUtilization,
        categoryWise,
      },
    })
  } catch (err) {
    console.error('[ANALYTICS_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
