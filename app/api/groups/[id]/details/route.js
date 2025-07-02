// app/api/groups/[id]/details/route.ts
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'

export async function GET(req, { params }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value
    const { id } = await params

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error('JWT Error:', err)
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    await dbConnect()

    const group = await Group.findById(id)
      .populate('members.user', 'name email image') // only if you're using ref
      .lean()

    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const isMember =
      group.admin === decoded.email ||
      group.members?.some((m) => m.user?.email === decoded.email)

    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      group,
    })
  } catch (err) {
    console.error('Group Detail Error:', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
