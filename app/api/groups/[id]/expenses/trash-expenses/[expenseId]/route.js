import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import GroupExpense from '@/lib/models/GroupExpense'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'

export async function DELETE(req, { params }) {
  const { id:groupId, expenseId } = await params

  const cookieStore = cookies()
  const token = cookieStore.get('authToken')?.value

  if (!groupId || !expenseId) {
    return NextResponse.json({ success: false, message: 'Missing groupId or expenseId' }, { status: 400 })
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

    const isMember =
      group.owner.equals(user._id) ||
      group.members.some(m => m.user.equals(user._id))

    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Access denied: Not a group member' }, { status: 403 })
    }

    const trashedExpense = await GroupExpense.findOneAndUpdate(
      { _id: expenseId, groupId },
      { trashed: true, trashedAt: new Date() },
      { new: true }
    )

    if (!trashedExpense) {
      return NextResponse.json({ success: false, message: 'Group expense not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Group expense moved to trash',
      expense: trashedExpense
    })

  } catch (err) {
    console.error('[GROUP_TRASH_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
