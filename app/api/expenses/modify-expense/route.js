import { NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'

const UpdateExpenseSchema = z.object({
  _id: z.string().min(1, 'Expense ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(val) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['credit', 'debit']),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time format',
  }),
})

export async function PUT(req) {  // <-- changed PATCH to PUT
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized: No token provided' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error('JWT Error:', err)
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    const body = await req.json()
    const result = UpdateExpenseSchema.safeParse(body)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const { _id, title, description, amount, category, type, date, time } = result.data
    const datetime = new Date(`${date}T${time}:00`)

    if (isNaN(datetime.getTime())) {
      return NextResponse.json({ success: false, message: 'Failed to parse datetime' }, { status: 400 })
    }

    await dbConnect()

    const updated = await Expense.findOneAndUpdate(
      { _id, userEmail: decoded.email },
      {
        title,
        description: description || '',
        amount: Number(amount),
        category,
        type,
        datetime,
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Expense not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
      expense: updated,  // <-- singular, matching client expectation
    })
  } catch (err) {
    console.error('Modify Expense Error:', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
