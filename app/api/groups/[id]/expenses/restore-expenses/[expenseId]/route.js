import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import GroupExpense from '@/lib/models/GroupExpense'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'

export async function PUT(req, { params }) {
  const { id:groupId, expenseId:id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('authToken')?.value

  if (!groupId || !id) {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  }

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized: No token provided' }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const user = await User.findOne({ email: decoded.email })
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

    const restoredExpense = await GroupExpense.findOneAndUpdate(
      { _id: id, groupId },
      { trashed: false, trashedAt: null },
      { new: true }
    )

    if (!restoredExpense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Group expense restored successfully',
      expense: restoredExpense
    }, { status: 200 })
  } catch (err) {
    console.error('[GROUP_EXPENSE_RESTORE_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
