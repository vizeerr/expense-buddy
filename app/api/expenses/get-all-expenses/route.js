import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'

export async function GET(req) {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.log(err);
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const trashed = searchParams.get('trashed') === 'true'

    const query = {
      userEmail: decoded.email,
      trashed, // ✅ Filter by trash state
    }

    if (type) query.type = type
    if (category) query.category = category
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ]
    }

    const expenses = await Expense.find(query)
      .sort({ datetime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Expense.countDocuments(query)
    const hasMore = page * limit < total

    return NextResponse.json({
      success: true,
      expenses,
      pagination: {
        page,
        total,
        hasMore,
      }
    })

  } catch (err) {
    console.error('Get Expenses Error:', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
