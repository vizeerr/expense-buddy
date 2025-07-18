import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import GroupExpense from '@/lib/models/GroupExpense'
import Group from '@/lib/models/Group'

const getMonth = (date) => new Date(date).getMonth()
const getYear = (date) => new Date(date).getFullYear()
const getWeek = (date) => {
  const d = new Date(date)
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d - start + (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60000
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
}

export async function GET(req, { params }) {
  try {
    const { id: groupId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized: No token' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.log(err);
      
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    await dbConnect()

    const userId = decoded._id
    const group = await Group.findById(groupId).lean()

    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const isMember = group.members.some(m => m.user.toString() === userId)
    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Forbidden: Not a group member' }, { status: 403 })
    }

    // ✅ Fetch non-trashed debit expenses only
    const expenses = await GroupExpense.find({
      groupId,
      type: 'debit',
      trashed: { $ne: true }
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

    for (let txn of expenses) {
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
    const weeklyAverage = totalMonthlyExpense / 4.3 // approx 4.3 weeks per month

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
    console.error('[GROUP_EXPENSE_SUMMARY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
