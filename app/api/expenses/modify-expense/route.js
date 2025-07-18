import { NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import User from '@/lib/models/User'

const UpdateExpenseSchema = z.object({
  _id: z.string().min(1, 'Expense ID is required'),
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .regex(/^[A-Za-z\s]+$/, 'Title cannot contain numbers or symbols'),
  description: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(val) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['credit', 'debit']),
  paymentMethod: z.enum(['upi', 'cash', 'card', 'netbanking', 'other']),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time format',
  }),
})

export async function PUT(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error('JWT Error:', err)
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    await dbConnect()

    // ✅ Check if user still exists
    const user = await User.findOne({ email: decoded.email })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    const body = await req.json()
    const result = UpdateExpenseSchema.safeParse(body)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const { _id, title, description, amount, category, type, paymentMethod, date, time } = result.data
    const datetime = new Date(`${date}T${time}:00`)

    if (isNaN(datetime.getTime())) {
      return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 400 })
    }

    const updated = await Expense.findOneAndUpdate(
      { _id, userEmail: decoded.email },
      {
        title,
        description: description || '',
        amount: Number(amount),
        category,
        paymentMethod,
        type,
        datetime,
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
    })

  } catch (err) {
    console.error('Modify Expense Error:', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
