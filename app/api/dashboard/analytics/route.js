// /app/api/dashboard/analytics/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'

const getWeekNumber = (date) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = ((date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000));
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

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
    const expenses = await Expense.find({ userEmail })

    const now = new Date()
    // const month = now.getMonth()
    // const year = now.getFullYear()

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

      const weeklyTxns = expenses.filter(e => getWeekNumber(new Date(e.datetime)) === week && e.type === 'debit')
      const total = weeklyTxns.reduce((sum, e) => sum + e.amount, 0)

      return {
        name: `Week ${week}`,
        expense: total,
      }
    })

    // 3️⃣ Budget Utilization (Area Chart)
    const areaData = Array.from({ length: 4 }, (_, i) => {
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
  budgetUtilization: areaData,
  categoryWise,
      },
    })
  } catch (err) {
    console.error('[ANALYTICS_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}