import { NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'
import GroupExpense from '@/lib/models/GroupExpense'

const GroupExpenseSchema = z.object({
  _id: z.string().min(1, 'Expense ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  amount: z.string().refine(val => !isNaN(val) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['credit', 'debit']),
  paymentMethod: z.enum(['upi', 'cash', 'card', 'netbanking', 'other']),
  paidBy: z.string().min(1, 'PaidBy is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time format',
  }),
})

export async function PUT(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const body = await req.json()
    const result = GroupExpenseSchema.safeParse(body)

 
if (!result.success) {
  const errors = result.error.flatten().fieldErrors
  return NextResponse.json({ success: false, errors }, { status: 400 })
}

    const {
      _id,
      title,
      description,
      amount,
      category,
      type,
      paymentMethod,
      paidBy,
      groupId,
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

    const newGroup = await Group.findById(groupId)
    if (!newGroup) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const isMember =
      newGroup.owner.equals(user._id) ||
      newGroup.members.some((m) => m.user.equals(user._id))

    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    const paidByUser = await User.findById(paidBy)

    if (!paidByUser) {
      return NextResponse.json({ success: false, message: 'Invalid paidBy user' }, { status: 400 })
    }

    const expense = await GroupExpense.findById(_id)
    if (!expense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
    }

    // ✅ Check if group has changed
    const groupChanged = !expense.groupId.equals(groupId)

    // ✅ Update all fields
    expense.title = title
    expense.description = description || ''
    expense.amount = Number(amount)
    expense.category = category
    expense.type = type
    expense.paymentMethod = paymentMethod
    expense.paidBy = paidBy
    expense.datetime = datetime
    expense.groupId = groupId // ✅ assign new group if changed

    await expense.save()

    return NextResponse.json({
      success: true,
      message: groupChanged
        ? 'Group expense updated and moved to new group'
        : 'Group expense updated successfully',
      expense,
    })
  } catch (err) {
    console.error('[GROUP_EXPENSE_MODIFY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
