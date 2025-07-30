import { NextResponse } from 'next/server'
import GroupExpense from '@/lib/models/GroupExpense'

import { verifyUser } from '@/lib/auth/VerifyUser'
import { verifyGroup } from '@/lib/auth/VerifyGroup'

const getMonth = (date) => new Date(date).getMonth()
const getYear = (date) => new Date(date).getFullYear()
const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}
const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate()

export async function GET(req, { params }) {
  try {
    const { success, user, response } = await verifyUser()
       if (!success) return response    
       
       const { id: groupId } = await params
       const userId = await user._id
       const { success:groupSuccess, response:groupResponse } = await verifyGroup(groupId,userId )
       if (!groupSuccess) return groupResponse
   

    // 📊 2. Fetch and calculate summary
    const expenses = await GroupExpense.find({ groupId, trashed: { $ne: true } })

    const now = new Date()
    const thisMonth = getMonth(now)
    const thisYear = getYear(now)
    const startOfWeek = getStartOfWeek(now)

    const filterByDate = (arr, filterFn) =>
      arr.filter(filterFn)

    const sum = (arr) => arr.reduce((total, e) => total + e.amount, 0)

    const thisMonthTxns = filterByDate(expenses, e => {
      const d = new Date(e.datetime)
      return getMonth(d) === thisMonth && getYear(d) === thisYear
    })

    const thisWeekTxns = filterByDate(expenses, e => {
      const d = new Date(e.datetime)
      return d >= startOfWeek && d <= now
    })

    const todayTxns = filterByDate(expenses, e => isSameDay(new Date(e.datetime), now))

    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    const lastMonth = getMonth(lastMonthDate)
    const lastYear = getYear(lastMonthDate)

    const lastMonthTxns = filterByDate(expenses, e => {
      const d = new Date(e.datetime)
      return getMonth(d) === lastMonth && getYear(d) === lastYear
    })

    const totalCredit = sum(expenses.filter(e => e.type === 'credit'))
    const totalDebit = sum(expenses.filter(e => e.type === 'debit'))
    const totalBalance = totalCredit - totalDebit

    const monthlyCredit = sum(thisMonthTxns.filter(e => e.type === 'credit'))
    const monthlyDebit = sum(thisMonthTxns.filter(e => e.type === 'debit'))

    const weeklyCredit = sum(thisWeekTxns.filter(e => e.type === 'credit'))
    const weeklyDebit = sum(thisWeekTxns.filter(e => e.type === 'debit'))

    const todayCredit = sum(todayTxns.filter(e => e.type === 'credit'))
    const todayDebit = sum(todayTxns.filter(e => e.type === 'debit'))

    const lastMonthCredit = sum(lastMonthTxns.filter(e => e.type === 'credit'))
    const lastMonthDebit = sum(lastMonthTxns.filter(e => e.type === 'debit'))
    const lastMonthBalance = lastMonthCredit - lastMonthDebit

    const daysUsed = new Set(thisMonthTxns.map(e => new Date(e.datetime).toDateString())).size || 1
    const dailyAverage = monthlyDebit / daysUsed

    const savingsRate = totalCredit > 0
      ? (((totalCredit - totalDebit) / totalCredit) * 100).toFixed(1)
      : '0.0'

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
    console.error('[GROUP_BALANCE_SUMMARY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
