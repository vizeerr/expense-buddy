import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import Group from '@/lib/models/Group'

const InviteSchema = z.object({
  email: z.string().email('Invalid email'),
})

export async function POST(req, { params }) {
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
        
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    const body = await req.json()
    const result = InviteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    await dbConnect()

    const currentUser = await User.findOne({ email: decoded.email }).select('_id email')
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    // 🔒 Only Owner or Admins can invite
    const isOwner = group.owner.equals(currentUser._id)
    const isAdmin = group.members.some(m => m.user.equals(currentUser._id) && m.role === 'admin')
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Only owner or admin can invite' }, { status: 403 })
    }

    // ✅ Find invited user
    const invitedUser = await User.findOne({ email: result.data.email }).select('_id name email')
    if (!invitedUser) {
      return NextResponse.json({ success: false, message: 'User with this email does not exist' }, { status: 404 })
    }

    const alreadyMember =
      group.owner.equals(invitedUser._id) ||
      group.members.some(m => m.user.equals(invitedUser._id))

    if (alreadyMember) {
      return NextResponse.json({ success: false, message: 'User is already a group member' }, { status: 400 })
    }

    // 👥 Add member
    group.members.push({
      user: invitedUser._id,
      role: 'member',
    })
    await group.save()

    return NextResponse.json({
      success: true,
      message: 'User invited successfully',
    })
  } catch (err) {
    console.error('[GROUP_INVITE_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
