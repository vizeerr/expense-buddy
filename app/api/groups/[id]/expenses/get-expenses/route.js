import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'

import Group from '@/lib/models/Group'
import GroupExpense from '@/lib/models/GroupExpense'
import User from '@/lib/models/User'

export async function GET(req, { params }) {
  try {
    const { id: groupId } =await params
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const user = await User.findOne({ email: decoded.email }).select('_id')
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 401 })
    }

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const isMember = group.owner.equals(user._id) || group.members.some(m => m.user.equals(user._id))
    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    // 🔎 Extract filters from query params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const paymentMethod = searchParams.get('paymentMethod') || ''
    const trashed = searchParams.get('trashed') === 'true'
    const paidBy = searchParams.get('paidBy') || ''
    const addedBy = searchParams.get('addedBy') || ''

    // 🧠 Build dynamic query
    const query = {
      groupId,
      trashed,
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    if (type) query.type = type
    if (category) query.category = category
    if (paymentMethod) query.paymentMethod = paymentMethod
    if (paidBy) query.paidBy = paidBy
    if (addedBy) query.addedBy = addedBy

    const skip = (page - 1) * limit

    const expenses = await GroupExpense.find(query)
      .sort({ datetime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('addedBy', 'name email')
      .populate('paidBy', 'name email')

    const total = await GroupExpense.countDocuments(query)

    return NextResponse.json({
      success: true,
      expenses,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + expenses.length < total,
      }
    })
  } catch (err) {
    console.error('[GROUP_EXPENSES_FETCH_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
