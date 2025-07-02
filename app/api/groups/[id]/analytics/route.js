import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import Group from '@/lib/models/Group'

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
      console.log(err);
      
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    await dbConnect()

    // ✅ Load group and populate user emails
    const group = await Group.findById(id).populate('members.user', 'email')
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    // ✅ Check if user is a member
    const isMember = group.members.some((m) => m.user?.email === decoded.email)
    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    // ✅ Fetch valid group expenses
    const allExpenses = await Expense.find({ group: id, trashed: { $ne: true } })
    const now = new Date()

    // ✅ 1. Balance Trend (Past 4 Weeks)
    const balanceTrend = Array.from({ length: 4 }, (_, i) => {
      const start = new Date(now)
      start.setDate(start.getDate() - i * 7)
      start.setHours(0, 0, 0, 0)

      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)

      const weeklyExpenses = allExpenses.filter(e => {
        const d = new Date(e.datetime)
        return d >= start && d <= end
      })

      const credit = weeklyExpenses.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0)
      const debit = weeklyExpenses.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0)

      return {
        name: `Week ${4 - i}`,
        balance: credit - debit,
      }
    }).reverse()

    // ✅ 2. Expense Pattern (Bar - 7 days)
    const expensePattern = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const total = allExpenses
        .filter(e => new Date(e.datetime).toDateString() === date.toDateString())
        .reduce((sum, e) => sum + e.amount, 0)

      return {
        name: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        expense: total,
      }
    }).reverse()

    // ✅ 3. Budget Utilization (Area - 7 days)
    const budgetUtilization = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const total = allExpenses
        .filter(e => new Date(e.datetime).toDateString() === date.toDateString())
        .reduce((sum, e) => sum + e.amount, 0)

      return {
        name: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        expense: total,
      }
    }).reverse()

    // ✅ 4. Category-wise Expenditure (Pie)
    const categoryMap = {}
    for (const e of allExpenses) {
      if (!e.category) continue
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
    }

    const categoryWise = Object.entries(categoryMap).map(([name, price]) => ({ name, price }))

    // ✅ Return analytics data
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
    console.error('[GROUP_ANALYTICS_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
