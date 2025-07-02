import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import Expense from '@/lib/models/Expense'

const getMonth = (date) => new Date(date).getMonth()
const getYear = (date) => new Date(date).getFullYear()

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
      console.error('[JWT_ERROR]', err)
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    await dbConnect()

    const group = await Group.findById(id).populate('members.user', 'email')
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    // ✅ Check if requester is a member
    const isMember = group.members.some((m) => m.user?.email === decoded.email)
    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    const now = new Date()
    const thisMonth = getMonth(now)
    const thisYear = getYear(now)

    const monthlyBudget = group.monthlyBudget || 0

    // ✅ Get this month's non-trashed expenses
    const expenses = await Expense.find({ group: id, trashed: { $ne: true } })

    const thisMonthExpenses = expenses.filter((e) => {
      const d = new Date(e.datetime)
      return getMonth(d) === thisMonth && getYear(d) === thisYear
    })

    const usedBudget = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
    const remainingBudget = Math.max(monthlyBudget - usedBudget, 0)

    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()

    const goalProgress = monthlyBudget > 0
      ? Number(((usedBudget / monthlyBudget) * 100).toFixed(1))
      : 0

    // ✅ Most Expended Category
    const categoryMap = {}
    thisMonthExpenses.forEach((e) => {
      if (!e.category) return
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
    })

    const mostExpendedCategory = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount }))[0] || { name: '-', amount: 0 }

    return NextResponse.json({
      success: true,
      data: {
        monthlyBudget,
        usedBudget,
        remainingBudget,
        daysLeft,
        goalProgress,
        mostExpendedCategory,
      },
    })
  } catch (err) {
    console.error('[GROUP_BUDGET_SUMMARY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
