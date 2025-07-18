// import { NextResponse } from 'next/server'
// import { cookies } from 'next/headers'
// import jwt from 'jsonwebtoken'
// import dbConnect from '@/lib/mongodb'
// import Expense from '@/lib/models/Expense'
// import User from '@/lib/models/User'

// import getBudgetSummary from '@/lib/summary/getBudgetSummary'
// import getExpenseSummary from '@/lib/summary/getExpenseSummary'
// import getBalanceSummary from '@/lib/summary/getBalanceSummary'
// import getAnalyticsSummary from '@/lib/summary/getAnalyticsSummary'

// const getMonth = (date) => date.getMonth()
// const getYear = (date) => date.getFullYear()
// const getWeek = (date) => {
//   const d = new Date(date)
//   const start = new Date(d.getFullYear(), 0, 1)
//   const diff = ((d - start) + (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60000)
//   return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
// }

// export async function GET(_, { params }) {
//   try {
//     const cookieStore = await cookies()
//     const token = cookieStore.get('authToken')?.value
//     if (!token) {
//       return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET)
//     await dbConnect()

//     const [user, expenses] = await Promise.all([
//       User.findOne({ email: decoded.email }),
//       Expense.find({ userEmail: decoded.email, trashed: { $ne: true } })
//     ])

//     const now = new Date()
//     const typeParam = params.type || 'all'
//     const types = typeParam.split(',').map(s => s.trim())

//     const responseData = {}

//     const summaryInputs = { expenses, user, now, getMonth, getYear, getWeek }

//     if (types.includes('all') || types.includes('budget')) {
//       responseData.budget = await getBudgetSummary(summaryInputs)
//     }

//     if (types.includes('all') || types.includes('expense')) {
//       responseData.expense = await getExpenseSummary(summaryInputs)
//     }

//     if (types.includes('all') || types.includes('balance')) {
//       responseData.balance = await getBalanceSummary(summaryInputs)
//     }

//     if (types.includes('all') || types.includes('analytics')) {
//       responseData.analytics = await getAnalyticsSummary(summaryInputs)
//     }

//     return NextResponse.json({ success: true, data: responseData })

//   } catch (err) {
//     console.error('[SUMMARY_API_ERROR]', err)
//     return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
//   }
// }
