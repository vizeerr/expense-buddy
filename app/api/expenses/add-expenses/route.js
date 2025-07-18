import { NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import User from '@/lib/models/User'

// 🛡️ Zod schema (unchanged — validate inputs separately)
const ExpenseSchema = z.object({
  title: z.string()
  .min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(val) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['credit', 'debit']),
  paymentMethod: z.enum(['upi', 'cash', 'card', 'netbanking', 'other']), // ✅ Add this
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time format',
  }),
})


export async function POST(req) {
  
  try {
    
    await dbConnect()
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    // ✅ Verify JWT
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error('JWT Error:', err)
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    // ✅ Ensure user still exists
    const user = await User.findOne({ email: decoded.email })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }


    const body = await req.json()
    const result = ExpenseSchema.safeParse(body)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const { title, description, amount, category, type, paymentMethod, date, time } = result.data


    // ⏰ Combine date and time into a full Date object
    const datetime = new Date(`${date}T${time}:00`)

    if (isNaN(datetime.getTime())) {
      return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 400 })
    }


    const newExpense = new Expense({
      userEmail: decoded.email,
      title,
      description: description || '',
      amount: Number(amount),
      category,
      paymentMethod,
      type,
      datetime,
    })

    await newExpense.save()
   

    return NextResponse.json({
      success: true,
      message: 'Expense added successfully',
      expenses: newExpense
    })

  } catch (err) {
    console.error('Expense Add Error:', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
