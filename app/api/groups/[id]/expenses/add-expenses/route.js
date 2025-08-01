import { NextResponse } from 'next/server'
import User from '@/lib/models/User'
import GroupExpense from '@/lib/models/GroupExpense'
import { groupExpenseSchema } from '@/lib/schemas/ValidationSchema'
import { verifyUser } from '@/lib/auth/VerifyUser'
import { verifyGroup } from '@/lib/auth/VerifyGroup'

export async function POST(req, { params }) {
  try {
    const { success, user, response } = await verifyUser()
    if (!success) return response

    const { id: groupId } = await params
    const userId = user._id

    const { success: groupSuccess, response: groupResponse } = await verifyGroup(groupId, userId)
    if (!groupSuccess) return groupResponse

    const body = await req.json()
    const result = groupExpenseSchema.safeParse({ ...body, groupId })

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      amount,
      category,
      type,
      paymentMethod,
      paidBy,
      splitBetween,
      date,
      time,
    } = result.data

    // Final parse
    const datetime = new Date(`${date}T${time}:00`)
    if (isNaN(datetime.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid datetime' }, { status: 400 })
    }

    // Validate paidBy user
    const paidByUser = await User.findById(paidBy)
    if (!paidByUser) {
      return NextResponse.json({ success: false, message: 'Invalid paidBy user' }, { status: 400 })
    }

    // Validate all splitBetween user IDs
    const validUsers = await User.find({ _id: { $in: splitBetween } }).select('_id')
    const validUserIds = validUsers.map((u) => u._id.toString())

    const invalidIds = splitBetween.filter((id) => !validUserIds.includes(id))
    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Some users in splitBetween are invalid',
          invalidUserIds: invalidIds,
        },
        { status: 400 }
      )
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
      splitBetween,
      paidBy,
      datetime,
    })

    await newExpense.save()
    await newExpense.populate([
      { path: 'addedBy', select: 'name email' },
      { path: 'paidBy', select: 'name email' },
      { path: 'splitBetween', select: 'name email' },
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
