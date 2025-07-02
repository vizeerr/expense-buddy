import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import GroupExpense from '@/lib/models/GroupExpense'

const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.log(err)
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const userEmail = decoded.email
    await dbConnect()

    const group = await Group.findById(id)
      .populate('members.user', 'email')
      .lean()

    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const isMember = group.members.some(m => m.user?.email === userEmail)
    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    // ✅ Fetch non-trashed group expenses
    const allExpenses = await GroupExpense.find({
      groupId: id,
      trashed: { $ne: true }
    }).lean()

    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    const monthTxns = allExpenses.filter(e => {
      const d = new Date(e.datetime)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })

    const totalMonthlyExpense = monthTxns.reduce((sum, e) => sum + e.amount, 0)

    const daysUsed = new Set(monthTxns.map(e => new Date(e.datetime).toDateString())).size || 1
    const dailyAverage = totalMonthlyExpense / daysUsed

    const weeks = {}
    for (const txn of monthTxns) {
      const d = new Date(txn.datetime)
      const weekStart = getStartOfWeek(d).toDateString()
      weeks[weekStart] = (weeks[weekStart] || 0) + txn.amount
    }

    const weeklyValues = Object.values(weeks)
    const weeklyAverage = weeklyValues.length
      ? weeklyValues.reduce((a, b) => a + b, 0) / weeklyValues.length
      : 0

    const totalWeeklyExpense = weeklyValues.slice(-1)[0] || 0

    const months = {}
    for (const txn of allExpenses) {
      const d = new Date(txn.datetime)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      months[key] = (months[key] || 0) + txn.amount
    }

    const monthlyValues = Object.values(months)
    const monthlyAverage = monthlyValues.length
      ? monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length
      : 0

    const categoryMap = {}
    for (const txn of monthTxns) {
      if (!txn.category?.name) continue
      const key = txn.category.name
      categoryMap[key] = {
        name: key,
        amount: (categoryMap[key]?.amount || 0) + txn.amount,
      }
    }

    const mostExpendedCategory = Object.values(categoryMap).sort((a, b) => b.amount - a.amount)[0] || null

    return NextResponse.json({
      success: true,
      data: {
        totalMonthlyExpense,
        dailyAverage: Number(dailyAverage.toFixed(2)),
        weeklyAverage: Number(weeklyAverage.toFixed(2)),
        monthlyAverage: Number(monthlyAverage.toFixed(2)),
        totalWeeklyExpense,
        mostExpendedCategory,
      },
    })
  } catch (err) {
    console.error('[GROUP_EXPENSE_SUMMARY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
