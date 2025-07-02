import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import Expense from '@/lib/models/Expense'
import User from '@/lib/models/User'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Utility functions
const getMonth = (date) => new Date(date).getMonth()
const getYear = (date) => new Date(date).getFullYear()

export async function GET(req, { params }) {
  try {
    const { id } = await params
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, message: 'Invalid group ID' }, { status: 400 })
    }

    await dbConnect()

    // ✅ 1. Verify token
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
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    const userEmail = decoded.email

    // ✅ 2. Find User ID from email
    const user = await User.findOne({ email: userEmail }).select('_id')
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 401 })
    }

    const userId = user._id

    // ✅ 3. Fetch group and check membership
    const group = await Group.findById(id).lean()
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const memberEntry = group.members?.find((m) => m.user.toString() === userId.toString())

    if (!memberEntry) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    // ✅ 4. Fetch non-trashed group expenses
    const expenses = await Expense.find({ group: id, trashed: { $ne: true } })

    const now = new Date()
    const thisMonth = getMonth(now)
    const thisYear = getYear(now)

    const thisMonthTxns = expenses.filter((e) => {
      const d = new Date(e.datetime)
      return getMonth(d) === thisMonth && getYear(d) === thisYear
    })

    const totalCredit = expenses
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0)

    const totalDebit = expenses
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0)

    const totalBalance = totalCredit - totalDebit

    const daysUsed = new Set(thisMonthTxns.map(e => new Date(e.datetime).toDateString())).size || 1

    const dailyAverage = thisMonthTxns
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0) / daysUsed

    const savingsRate = totalCredit > 0
      ? Number(((totalCredit - totalDebit) / totalCredit) * 100).toFixed(1)
      : '0.0'

    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)

    const lastMonth = getMonth(lastMonthDate)
    const lastYear = getYear(lastMonthDate)

    const lastMonthTxns = expenses.filter((e) => {
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

    return NextResponse.json({
      success: true,
      data: {
        totalBalance,
        totalCredit,
        totalDebit,
        dailyAverage: Number(dailyAverage.toFixed(2)),
        savingsRate: Number(savingsRate),
        lastMonthBalance
      }
    })

  } catch (err) {
    console.error('[GROUP_BALANCE_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
