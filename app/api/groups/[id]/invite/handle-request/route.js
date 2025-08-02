// /api/groups/[id]/handle-request.js

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'

export async function POST(req, { params }) {
  try {
    const { id: groupId } = await params
    const { userId, action } = await req.json()

    if (!userId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action or userId' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const authUser = await User.findOne({ email: decoded.email }).select('_id')
    if (!authUser) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    const group = await Group.findById(groupId)
    if (!group) return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })

    const isOwner = group.owner.equals(authUser._id)
    const isAdmin = group.members.some(m => m.user.equals(authUser._id) && m.role === 'admin')
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Only owner or admin can approve requests' }, { status: 403 })
    }

    const requestIndex = group.joinRequests.findIndex(r => r.user.equals(userId))
    if (requestIndex === -1) {
      return NextResponse.json({ success: false, message: 'No such request' }, { status: 404 })
    }

    if (action === 'approve') {
      group.members.push({ user: userId }) // default role: member
    }
    group.joinRequests.splice(requestIndex, 1)
    await group.save()

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'User added to group' : 'Request rejected'
    })
  } catch (err) {
    console.error('[HANDLE_JOIN_REQUEST_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
