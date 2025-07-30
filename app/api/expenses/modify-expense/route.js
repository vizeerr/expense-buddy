import { NextResponse } from 'next/server'
import { z } from 'zod'
import Expense from '@/lib/models/Expense'
import { verifyUser } from '../../../../lib/auth/VerifyUser'

const UpdateExpenseSchema = z.object({
  _id: z.string().min(1, 'Expense ID is required'),
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(25, "Max 25 characters"),

  description: z.string().max(200, "Max 200 characters").optional(),

  amount: z
    .string({ required_error: 'Amount is required' })
     .refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0 && num <= 9999999.99
  }, {
    message: 'Amount must be a valid between 0 and 9999999.99',
  }),

  category: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Category is required'),

  type: z
    .string({ required_error: 'Type is required' })
    .min(1, 'Type is required') // 🚫 catches empty string
    .refine((val) => ['credit', 'debit'].includes(val), {
      message: 'Invalid type',
    }),

  paymentMethod: z
    .string({ required_error: 'Payment method is required' })
    .min(1, 'Payment method  is required') // 🚫 catches empty string
    .refine((val) => ['upi', 'cash', 'card', 'netbanking', 'other'].includes(val), {
      message: 'Invalid payment method',
    }),

   date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z
    .string({ required_error: 'Time is required' })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Invalid time format (HH:mm)',
    }),
})

export async function PUT(req) {
  try {

        const { success, user, response } = await verifyUser()
        if (!success) return response    
   
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
      { _id, userEmail: user.email },
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
