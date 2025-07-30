// pages/api/expenses/get-all-expenses/route.js
import { NextResponse } from 'next/server'
import Expense from '@/lib/models/Expense'
import { verifyUser } from '../../../../lib/auth/VerifyUser'

export async function GET(req) {
  try {
    const { success, user, response } = await verifyUser()
    if (!success) return response    

    const { searchParams } = new URL(req.url)

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const paymentMethod = searchParams.get('paymentMethod') || ''
    const search = searchParams.get('search') || ''
    const trashed = searchParams.get('trashed') === 'true'

    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const query = {
      userEmail: user.email,
      trashed,
    }

    if (type) query.type = type
    if (category) query.category = category
    if (paymentMethod) query.paymentMethod = paymentMethod

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ]
    }

    if (fromDate || toDate) {
      query.datetime = {}
      if (fromDate) query.datetime.$gte = new Date(fromDate)
      if (toDate) query.datetime.$lte = new Date(toDate)
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ datetime: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Expense.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      expenses,
      pagination: {
        page,
        total,
        hasMore: page * limit < total,
      }
    })

  } catch (err) {
    console.error('Get Expenses Error:', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
