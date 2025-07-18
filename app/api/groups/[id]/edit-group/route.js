import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'

// ✅ Zod validation schema
const GroupUpdateSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().max(500, 'Description too long').optional()
})

export async function PUT(req, { params }) {
  try {
    const { id: groupId } =await  params
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized: No token' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error('[JWT_VERIFY_ERROR]', err)
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    const body = await req.json()
    const result = GroupUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, description } = result.data

    await dbConnect()

    const user = await User.findOne({ email: decoded.email }).select('_id')
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    // ✅ Allow Owner or Admin
    const isOwner = group.owner.equals(user._id)
    const isAdmin = group.members.some(m => m.user.equals(user._id) && m.role === 'admin')

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Only owner or admin can edit group' }, { status: 403 })
    }

    group.name = name
    if (description !== undefined) {
      group.description = description.trim()
    }

    await group.save()

    return NextResponse.json({
      success: true,
      message: 'Group updated successfully',
      group
    })
  } catch (err) {
    console.error('[GROUP_EDIT_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
