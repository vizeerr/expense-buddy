import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'

// 🛠️ Helpers
const getMonth = (date) => new Date(date).getMonth()
const getYear = (date) => new Date(date).getFullYear()
const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
  return new Date(d.setDate(diff))
}
const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate()

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized: No token provided' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error('JWT Error:', err)
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    await dbConnect()
    const userEmail = decoded.email

    // ✅ Fetch only non-trashed expenses
    const expenses = await Expense.find({ userEmail, trashed: { $ne: true } })

    const now = new Date()
    const thisMonth = getMonth(now)
    const thisYear = getYear(now)

    // 📅 Monthly
    const thisMonthTxns = expenses.filter(e => {
      const d = new Date(e.datetime)
      return getMonth(d) === thisMonth && getYear(d) === thisYear
    })

    const monthlyCredit = thisMonthTxns
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0)

    const monthlyDebit = thisMonthTxns
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0)

    // 📅 Weekly
    const startOfWeek = getStartOfWeek(now)
    const endOfWeek = now

    const thisWeekTxns = expenses.filter(e => {
      const d = new Date(e.datetime)
      return d >= startOfWeek && d <= endOfWeek
    })

    const weeklyCredit = thisWeekTxns
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0)

    const weeklyDebit = thisWeekTxns
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0)

    // 📅 Today
    const todayTxns = expenses.filter(e => isSameDay(new Date(e.datetime), now))

    const todayCredit = todayTxns
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0)

    const todayDebit = todayTxns
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0)

    // 📊 Overall
    const creditTxns = expenses.filter(e => e.type === 'credit')
    const debitTxns = expenses.filter(e => e.type === 'debit')

    const totalCredit = creditTxns.reduce((sum, e) => sum + e.amount, 0)
    const totalDebit = debitTxns.reduce((sum, e) => sum + e.amount, 0)
    const totalBalance = totalCredit - totalDebit

    const daysUsed = new Set(thisMonthTxns.map(e => new Date(e.datetime).toDateString())).size || 1
    const dailyAverage = thisMonthTxns
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0) / daysUsed

    const savingsRate = totalCredit > 0
      ? (((totalCredit - totalDebit) / totalCredit) * 100).toFixed(1)
      : '0.0'

    // 📆 Last Month
    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    const lastMonth = getMonth(lastMonthDate)
    const lastYear = getYear(lastMonthDate)

    const lastMonthTxns = expenses.filter(e => {
      const d = new Date(e.datetime)
      return getMonth(d) === lastMonth && getYear(d) === lastYear
    })

    const lastMonthCredit = lastMonthTxns
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0)

    const lastMonthDebit = lastMonthTxns
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0)

    const lastMonthBalance = lastMonthCredit - lastMonthDebit
    const spendingTrend = totalDebit > lastMonthDebit ? 'up' : 'down'
    const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' })

    return NextResponse.json({
      success: true,
      data: {
        totalBalance,
        totalCredit,
        totalDebit,
        todayCredit,
        todayDebit,
        monthlyCredit,
        monthlyDebit,
        weeklyCredit,
        weeklyDebit,
        dailyAverage: Number(dailyAverage.toFixed(2)),
        savingsRate: Number(savingsRate),
        lastMonthBalance,
        lastMonthCredit,
        lastMonthDebit,
        spendingTrend,
        monthLabel,
      },
    })
  } catch (err) {
    console.error('[BALANCE_SUMMARY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
