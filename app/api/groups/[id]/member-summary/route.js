import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import GroupExpense from '@/lib/models/GroupExpense'
import User from '@/lib/models/User'

export async function GET(_, { params }) {
  try {
    const { id: groupId } = await params

    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value
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

    const user = await User.findOne({ email: decoded.email }).select('_id')
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const isMember =
      group.owner.equals(user._id) || group.members.some(m => m.user.equals(user._id))

    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    // 📦 Fetch all group expenses (not trashed)
    const expenses = await GroupExpense.find({
      groupId,
      trashed: { $ne: true }
    }).populate('paidBy', 'name email')

    const totalGroupAmount = expenses.reduce((sum, e) => sum + e.amount, 0) || 1

    const memberMap = {}

    expenses.forEach((e) => {
      if (!e.paidBy) return // skip if no paidBy (just in case)

      const key = e.paidBy._id.toString()
      if (!memberMap[key]) {
        memberMap[key] = {
            _id: e.paidBy._id,
            name: e.paidBy.name,
            email: e.paidBy.email,
          totalAmount: 0,
          expenseCount: 0,
        }
      }

      memberMap[key].totalAmount += e.amount
      memberMap[key].expenseCount += 1
    })

    const members = Object.values(memberMap).map(m => ({
      ...m,
      percentage: Number(((m.totalAmount / totalGroupAmount) * 100).toFixed(1)),
    }))

    return NextResponse.json({
      success: true,
      members,
    })

  } catch (err) {
    console.error('[GROUP_MEMBER_SUMMARY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
