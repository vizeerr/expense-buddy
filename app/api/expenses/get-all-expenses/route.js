import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import User from '@/lib/models/User'

export async function GET(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error('Token Verification Error:', err)
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    await dbConnect()

    // ✅ Step: Check if user still exists
    const user = await User.findOne({ email: decoded.email })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    // ✅ Fallbacks with bounds
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const paymentMethod = searchParams.get('paymentMethod') || ''
    const search = searchParams.get('search') || ''
    const trashed = searchParams.get('trashed') === 'true'

    const query = {
      userEmail: decoded.email,
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
