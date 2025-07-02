import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

// Add Zod for validation (optional but recommended)
import { z } from 'zod'

const BudgetSchema = z.object({
  budget: z.number().min(0, 'Budget must be a non-negative number'),
})

export async function PUT(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const email = decoded.email

    const body = await req.json()
    const parsed = BudgetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const budget = Number(parsed.data.budget)

    await dbConnect()

    const user = await User.findOneAndUpdate(
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
      monthlyBudget: user.monthlyBudget
    })
  } catch (err) {
    console.error('[UPDATE_BUDGET_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
