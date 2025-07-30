import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import { z } from 'zod'

import { verifyUser } from '@/lib/auth/VerifyUser'


// ✅ Zod schema for validation
const BudgetSchema = z.object({
  budget: z.number().min(0, 'Budget must be a non-negative number')
})

export async function PUT(req, { params }) {
  try {
   const { success, user, response } = await verifyUser()
           if (!success) return response    
           
           const { id: groupId } = await params
           const userId = await user._id
          
    const body = await req.json()
    const parsed = BudgetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    await dbConnect()

    const group = await Group.findById(groupId)

    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    const isMember = group.owner.equals(userId) || group.members.some(m => m.user.equals(userId))
      if (!isMember) {
        return NextResponse.json({ success: false, message: 'Not a group member' }, { status: 403 })
      }

    group.monthlyBudget = parsed.data.budget
    await group.save()

    return NextResponse.json({
      success: true,
      message: 'Group budget updated successfully',
    })

  } catch (err) {
    console.error('[GROUP_UPDATE_BUDGET_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
