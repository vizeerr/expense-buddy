import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import GroupExpense from '@/lib/models/GroupExpense'

const getWeekNumber = (date) => {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = (date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000))
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
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
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    await dbConnect()
    const userId = decoded._id

    // 🧠 Check Group
    const group = await Group.findById(groupId).lean()
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const isMember = group.members.some(m => m.user.toString() === userId)
    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Forbidden: Not a group member' }, { status: 403 })
    }

    const now = new Date()
    const expenses = await GroupExpense.find({
      groupId,
      trashed: { $ne: true },
    })

    // 1️⃣ Balance Trend (Line Chart)
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
    console.error('[GROUP_ANALYTICS_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
