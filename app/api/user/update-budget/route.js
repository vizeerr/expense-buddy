import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import { z } from 'zod'
import { verifyUser } from '../../../../lib/auth/VerifyUser'

const BudgetSchema = z.object({
  budget: z.number().min(0, 'Budget must be a non-negative number'),
})

export async function PUT(req) {
  try {
   const { success, user, response } = await verifyUser()
     if (!success) return response    
      
    const email = user.email

    const body = await req.json()
    const parsed = BudgetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const budget = Number(parsed.data.budget)

    await dbConnect()

    const userOne = await User.findOneAndUpdate(
      { email },
      { $set: { monthlyBudget: budget } },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Budget updated successfully',
      monthlyBudget: userOne.monthlyBudget
    })
  } catch (err) {
    console.error('[UPDATE_BUDGET_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
