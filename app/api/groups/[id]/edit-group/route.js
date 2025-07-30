import { NextResponse } from 'next/server'
import { z } from 'zod'
import Group from '@/lib/models/Group'

import { verifyUser } from '@/lib/auth/VerifyUser'
// ✅ Zod validation schema
const GroupUpdateSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().max(500, 'Description too long').optional()
})

export async function PUT(req, { params }) {
  try {


     const { success, user, response } = await verifyUser()
       if (!success) return response    
    
       const { id: groupId } = await params

    const body = await req.json()
    const result = GroupUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, description } = result.data


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
