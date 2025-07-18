import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import GroupExpense from '@/lib/models/GroupExpense'

const getMonth = (date) => new Date(date).getMonth()
const getYear = (date) => new Date(date).getFullYear()

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

    // 🧠 Check if group exists
    const group = await Group.findById(groupId).lean()
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    // ✅ Is user a member of the group?
    const isMember = group.members.some(m => m.user.toString() === userId)
    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Forbidden: Not a group member' }, { status: 403 })
    }

    const monthlyBudget = group.monthlyBudget || 0

    // 📦 Get all group expenses
    const expenses = await GroupExpense.find({ groupId, trashed: { $ne: true } })

    const now = new Date()
    const thisMonth = getMonth(now)
    const thisYear = getYear(now)

    const thisMonthTxns = expenses.filter(e => {
      const d = new Date(e.datetime)
      return getMonth(d) === thisMonth && getYear(d) === thisYear
    })

    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    const lastMonth = getMonth(lastMonthDate)
    const lastYear = getYear(lastMonthDate)

    const lastMonthTxns = expenses.filter(e => {
      const d = new Date(e.datetime)
      return getMonth(d) === lastMonth && getYear(d) === lastYear
    })

    const usedBudget = thisMonthTxns
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0)

    const remainingBudget = Math.max(monthlyBudget - usedBudget, 0)

    const daysUsed = new Set(thisMonthTxns.map(e => new Date(e.datetime).toDateString())).size || 1
    const dailyAverage = usedBudget / daysUsed

    const totalCredit = expenses.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0)
    const totalDebit = expenses.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0)
    const totalBalance = totalCredit - totalDebit

    const lastMonthCredit = lastMonthTxns.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0)
    const lastMonthDebit = lastMonthTxns.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0)
    const lastMonthBalance = lastMonthCredit - lastMonthDebit

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysLeft = Math.max(daysInMonth - daysUsed, 0)

    const goalProgress = monthlyBudget > 0
      ? Math.min(100, ((monthlyBudget - remainingBudget) / monthlyBudget) * 100).toFixed(1)
      : '0.0'

    // 🔍 Most Expended Category
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
    console.error('[GROUP_BUDGET_SUMMARY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
