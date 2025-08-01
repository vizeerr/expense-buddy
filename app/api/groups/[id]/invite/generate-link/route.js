import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import Group from '@/lib/models/Group'

export async function POST(req, { params }) {
  try {
    const { id: groupId } = params
    const cookieStore = cookies()
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
    const isAdmin = group.members.some(m => m.user.equals(authUser._id) && m.role === 'admin')

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    // Generate JWT for invite
    const inviteToken = jwt.sign(
      {
        groupId,
        type: 'group-invite',
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d' // ⏳ Valid for 7 days
      }
    )

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const fullLink = `${baseUrl}/dashboard/groups/join?token=${inviteToken}`

    return NextResponse.json({
      success: true,
      link: fullLink
    })

  } catch (err) {
    console.error('[GENERATE_INVITE_LINK_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
  }
}
