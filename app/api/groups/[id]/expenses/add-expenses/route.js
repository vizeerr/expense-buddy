import { NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'
import GroupExpense from '@/lib/models/GroupExpense'

// ✅ Zod schema for validation
const GroupExpenseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  amount: z.string().refine(val => !isNaN(val) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['credit', 'debit']),
  paymentMethod: z.enum(['upi', 'cash', 'card', 'netbanking', 'other']),
  paidBy: z.string().min(1, 'PaidBy is required'),
  groupId: z.string().min(1, 'PaidBy is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time format',
  }),
})

export async function POST(req, { params }) {
  try {
    const { id: groupId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const body = await req.json()
    const result = GroupExpenseSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const {
      title,
      description,
      amount,
      category,
      type,
      paymentMethod,
      paidBy,
      date,
      time
    } = result.data

    const datetime = new Date(`${date}T${time}:00`)
    if (isNaN(datetime.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid datetime' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email: decoded.email }).select('_id email')
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 401 })
    }

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const isMember =
      group.owner.equals(user._id) ||
      group.members.some((m) => m.user.equals(user._id))

    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    const paidByUser = await User.findById(paidBy)
    if (!paidByUser) {
      return NextResponse.json({ success: false, message: 'Invalid paidBy user' }, { status: 400 })
    }

    const newExpense = new GroupExpense({
      groupId,
      title,
      description: description || '',
      amount: Number(amount),
      category,
      type,
      paymentMethod,
      addedBy: user._id,
      paidBy,
      datetime,
    })

    await newExpense.save()
     await newExpense.populate([
      { path: 'addedBy', select: 'name email' },
      { path: 'paidBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      message: 'Group expense added successfully',
      expense: newExpense,
    })
  } catch (err) {
    console.error('[GROUP_EXPENSE_ADD_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
