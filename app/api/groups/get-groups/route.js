import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    await dbConnect()
    const userEmail = decoded.email

    // Get user _id to match against createdBy
    const user = await User.findOne({ email: userEmail }).select('_id')
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 401 })
    }

    const userId = user._id.toString()

    // Fetch all groups with member info
    const allGroups = await Group.find({})
      .populate('members.user', 'email')
      .sort({ createdAt: -1 })

    const userGroups = allGroups.filter(group =>
      group.createdBy.toString() === userId ||               // ✅ Created by user
      group.members?.some(m => m.user?.email === userEmail)  // ✅ Member of group
    )

    return NextResponse.json({
      success: true,
      groups: userGroups,
    })

  } catch (err) {
    console.error('Fetch Groups Error:', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
