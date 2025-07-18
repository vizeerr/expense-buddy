// /api/groups/[id]/request-join.js

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'

export async function POST(req, { params }) {
  try {
    const { id: groupId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const user = await User.findOne({ email: decoded.email }).select('_id name email')
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    const group = await Group.findById(groupId)
    if (!group) return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })

    // Prevent duplicate members
    const isMember = group.owner.equals(user._id) || group.members.some(m => m.user.equals(user._id))
    if (isMember) {
      return NextResponse.json({ success: false, message: 'You are already a member' }, { status: 400 })
    }

    // Check if already requested
    const alreadyRequested = group.joinRequests.some(r => r.user.equals(user._id))
    if (alreadyRequested) {
      return NextResponse.json({ success: false, message: 'You have already requested to join' }, { status: 400 })
    }

    group.joinRequests.push({ user: user._id })
    await group.save()

    return NextResponse.json({ success: true, message: 'Join request sent' })
  } catch (err) {
    console.error('[GROUP_JOIN_REQUEST_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
