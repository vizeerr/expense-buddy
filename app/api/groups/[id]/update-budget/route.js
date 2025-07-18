import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import { z } from 'zod'

// ✅ Zod schema for validation
const BudgetSchema = z.object({
  budget: z.number().min(0, 'Budget must be a non-negative number')
})

export async function PUT(req, { params }) {
  try {
    const { id:groupId } = await params
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

    const userId = decoded._id
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

    const isMember = group.members.some(member => member.user.toString() === userId)
    if (!isMember) {
      return NextResponse.json({ success: false, message: 'Access denied: Not a group member' }, { status: 403 })
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
