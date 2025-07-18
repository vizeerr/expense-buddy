import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import Group from '@/lib/models/Group'

export async function POST(req, { params }) {
  try {
    const { id: groupId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const authUser = await User.findOne({ email: decoded.email }).select('_id email')
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const isOwner = group.owner.equals(authUser._id)
    const isAdmin = group.members.some(
      m => m.user.equals(authUser._id) && m.role === 'admin'
    )

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    const { userId, action } = await req.json()

    if (!userId || !['kick', 'promote', 'demote'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
    }

    if (authUser._id.equals(userId)) {
      return NextResponse.json({ success: false, message: 'You cannot perform this action on yourself' }, { status: 403 })
    }

    const targetMember = group.members.find(m => m.user.equals(userId))
    if (!targetMember) {
      return NextResponse.json({ success: false, message: 'User is not a member of the group' }, { status: 404 })
    }

    if (targetMember.user.equals(group.owner)) {
      return NextResponse.json({ success: false, message: 'Cannot modify the group owner' }, { status: 403 })
    }

    if (!isOwner && targetMember.role === 'admin') {
      return NextResponse.json({ success: false, message: 'Admins cannot manage other admins' }, { status: 403 })
    }

    if (action === 'kick') {
      group.members = group.members.filter(m => !m.user.equals(userId))
    } else if (action === 'promote') {
      targetMember.role = 'admin'
    } else if (action === 'demote') {
      targetMember.role = 'member'
    }

    await group.save()

    return NextResponse.json({
      success: true,
      message:
        action === 'kick' ? 'Member removed from group' :
        action === 'promote' ? 'Member promoted to admin' :
        'Member demoted to member',
    })

  } catch (err) {
    console.error('[MANAGE_MEMBER_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
